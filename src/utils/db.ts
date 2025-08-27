import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Question, SurveyData } from '@/context/SurveyContext';

const API_URL = `${window.location.protocol}//${window.location.hostname}:3001`;

interface FERDB extends DBSchema {
  submissions: { key: number; value: any };
  outbox: { key: number; value: any };
  meta: { key: string; value: any };
  files: { key: string; value: { name: string; data: string; mime: string; type: 'text' | 'audio'; question_id?: number; createdAt: number } };
}

let dbPromise: Promise<IDBPDatabase<FERDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<FERDB>('fer-db', 2, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          db.createObjectStore('submissions', { keyPath: 'id', autoIncrement: true });
          db.createObjectStore('outbox', { keyPath: 'id', autoIncrement: true });
          db.createObjectStore('meta');
        }
        if (oldVersion < 2) {
          db.createObjectStore('files', { keyPath: 'name' });
        }
      },
    });
  }
  return dbPromise;
}

export async function addSubmission(data: SurveyData) {
  const db = await getDB();

  const tsSafe = (data.timestamp || new Date().toISOString()).replace(/[:.]/g, '-');
  const base = `${data.station_id || 'TOTEM-1'}_${tsSafe}`;

  const items: Array<{ name: string; data: string; mime: string; type: 'text' | 'audio'; question_id: number }> = [];

  for (const q of data.questions) {
    const resp = data.responses?.[q.key];
    if (!resp) continue;
    if (resp.text) {
      const name = `${base}_q${q.id}_text.txt`;
      const dataUrl = `data:text/plain;charset=utf-8;base64,${btoa(unescape(encodeURIComponent(resp.text)))}`;
      items.push({ name, data: dataUrl, mime: 'text/plain', type: 'text', question_id: q.id });
    }
    if (resp.audio) {
      const name = `${base}_q${q.id}_audio.webm`;
      items.push({ name, data: resp.audio, mime: 'audio/webm', type: 'audio', question_id: q.id });
    }
  }

  // persist files separately
  const txFiles = (await db).transaction('files', 'readwrite');
  for (const f of items) {
    await txFiles.store.put({ ...f, createdAt: Date.now() });
  }
  await txFiles.done;

  const id = await db.add('submissions', { ...data, attachments: items.map(({ data: _d, ...rest }) => rest), savedAt: new Date().toISOString() });
  await db.add('outbox', { submissionId: id, payload: { ...data, attachments: items }, synced: false, createdAt: Date.now() });
  return id;
}

export async function getTodayCount(): Promise<number> {
  try {
    const response = await fetch(`${API_URL}/submissions/count/today`);
    if (!response.ok) {
      console.error('Failed to fetch today count');
      return 0;
    }
    const data = await response.json();
    return data.count;
  } catch (error) {
    console.error('Error fetching today count:', error);
    return 0;
  }
}

export async function syncOutbox(questions: Question[]) {
  if (!questions || questions.length === 0) {
    console.log('[syncOutbox] No questions available. Sync aborted.');
    return;
  }
  console.log('[syncOutbox] Attempting to sync...');
  if (!navigator.onLine) {
    console.log('[syncOutbox] Offline. Sync aborted.');
    return;
  }
  console.log('[syncOutbox] Online. Proceeding with sync.');
  const db = await getDB();

  const items = await db.getAll('outbox');
  const unsynced = items.filter((i) => !i.synced);
  console.log(`[syncOutbox] Found ${unsynced.length} items to sync.`);

  if (unsynced.length === 0) {
    return;
  }

  for (const item of unsynced) {
    console.log(`[syncOutbox] Processing item ID: ${item.id}`);
    try {
      const p = item.payload || {};

      // 1) Create submission via RPC call
      console.log(`[syncOutbox] Inserting submission for item ID: ${item.id} via RPC`);
      const rpcResponse = await fetch(`${API_URL}/rpc/submit_survey`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          station_id_arg: p.station_id,
          gender_arg: p.demographics?.gender ?? null,
          age_arg: p.demographics?.age ?? null,
          resident_arg: typeof p.demographics?.resident === 'boolean' ? p.demographics.resident : null,
        }),
      });

      if (!rpcResponse.ok) {
        throw new Error('Submission via RPC failed');
      }
      const new_submission_id = await rpcResponse.text();
      const subData = { id: new_submission_id };
      console.log(`[syncOutbox] Submission created with ID: ${subData.id}`);

      // 2) Prepare and upload answers
      const answers: any[] = [];
      const attachments: Array<{ name: string; data: string; mime: string; type: 'text' | 'audio'; question_id: number }> = p.attachments || [];
      console.log(`[syncOutbox] Processing ${attachments.length} attachments for submission ID: ${subData.id}`);

      for (const att of attachments) {
        let qid = att.question_id || (att as any).question;
        if (!qid) {
          const match = att.name.match(/q(\d+)/);
          if (match) {
            qid = parseInt(match[1], 10);
          }
        }

        if (att.type === 'text') {
          let text = '';
          try {
            const b64 = (att.data || '').split(',')[1] ?? '';
            text = decodeURIComponent(escape(atob(b64)));
          } catch {}
          answers.push({
            submission_id: subData.id,
            question_id: qid,
            type: 'text',
            storage_path: `inline://q${qid}.txt`,
            text_content: text,
          });
        } else if (att.type === 'audio') {
          const b64 = (att.data || '').split(',')[1] ?? '';
          const binary = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
          const blob = new Blob([binary], { type: att.mime || 'audio/webm' });

          const formData = new FormData();
          formData.append('submission_id', subData.id.toString());
          formData.append('question_id', qid.toString());
          formData.append('mime_type', att.mime || 'audio/webm');
          formData.append('size_bytes', binary.byteLength.toString());
          formData.append('audio', blob, att.name);

          const uploadResponse = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            body: formData,
          });

          if (!uploadResponse.ok) {
            throw new Error(`Audio upload failed for q${qid}: ${await uploadResponse.text()}`);
          }
          const { path } = await uploadResponse.json();
          answers.push({
            submission_id: subData.id,
            question_id: qid,
            type: 'audio',
            storage_path: path,
            mime_type: att.mime || 'audio/webm',
            size_bytes: binary.byteLength,
          });
        }
      }

      // 3) Insert all answers in a single batch
      console.log(`[syncOutbox] Inserting ${answers.length} answers for submission ID: ${subData.id}`);
      if (answers.length > 0) {
        const answersResponse = await fetch(`${API_URL}/answers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(answers),
        });
        if (!answersResponse.ok) {
          throw new Error(`Failed to insert answers: ${await answersResponse.text()}`);
        }
      }

      // 4) Mark as synced
      console.log(`[syncOutbox] Marking item ID ${item.id} as synced.`);
      await db.put('outbox', { ...item, synced: true, syncedAt: Date.now() });
      console.log(`[syncOutbox] Item ID ${item.id} successfully synced.`);
    } catch (e) {
      console.error(`[syncOutbox] Sync to backend failed for item ID: ${item.id}. Will retry later.`, { item, error: e });
    }
  }
}
