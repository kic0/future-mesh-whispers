document.addEventListener('DOMContentLoaded', () => {
  // --- Tab Switching Logic ---
  const tablinks = document.querySelectorAll('.tablinks');
  const tabcontents = document.querySelectorAll('.tabcontent');

  const openTab = (evt, tabName) => {
    tabcontents.forEach(tabcontent => {
      tabcontent.style.display = 'none';
    });
    tablinks.forEach(tablink => {
      tablink.className = tablink.className.replace(' active', '');
    });
    document.getElementById(tabName + '-tab').style.display = 'block';
    evt.currentTarget.className += ' active';
  };

  tablinks.forEach(tablink => {
    tablink.addEventListener('click', (evt) => {
      openTab(evt, tablink.dataset.tab);
    });
  });

  // Set the default open tab
  const defaultTab = document.querySelector('.tablinks');
  if (defaultTab) {
    document.getElementById(defaultTab.dataset.tab + '-tab').style.display = 'block';
    defaultTab.className += ' active';
  }
  // --- End Tab Switching Logic ---

  const submissionsList = document.getElementById('submissions');
  const detailsContent = document.getElementById('details-content');

  let submissions = [];

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('/api/submissions');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      submissions = await response.json();
      renderSubmissions();
    } catch (error) {
      console.error('Error fetching submissions:', error);
      alert('Failed to fetch submissions. Please check the console for more details.');
    }
  };

  const renderSubmissions = () => {
    if (!submissionsList) return;
    submissionsList.innerHTML = '';
    submissions.forEach(submission => {
      const li = document.createElement('li');
      li.textContent = `Submission #${submission.id} - ${new Date(submission.created_at).toLocaleString()}`;
      li.dataset.id = submission.id;
      li.addEventListener('click', () => {
        renderSubmissionDetails(submission.id);
      });
      submissionsList.appendChild(li);
    });
  };

  const renderSubmissionDetails = async (id) => {
    if (!detailsContent) return;
    try {
      const response = await fetch(`/api/submissions/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const { submission, answers } = await response.json();

      detailsContent.innerHTML = `
        <h3>Submission #${submission.id}</h3>
        <form id="edit-submission-form">
          <label for="station_id">Station ID:</label>
          <input type="text" id="station_id" name="station_id" value="${submission.station_id}" required>
          <br>
          <label for="gender">Gender:</label>
          <input type="text" id="gender" name="gender" value="${submission.gender}" required>
          <br>
          <label for="age">Age:</label>
          <input type="number" id="age" name="age" value="${submission.age}" required>
          <br>
          <label for="resident">Resident:</label>
          <input type="text" id="resident" name="resident" value="${submission.resident}" required>
          <br>
          <button type="submit">Update Submission</button>
        </form>
        <button id="delete-submission" data-id="${submission.id}">Delete Submission</button>
        <hr>
        <h4>Answers</h4>
        <ul>
          ${answers.map(answer => `
            <li id="answer-${answer.id}">
              <strong>Question ID:</strong> ${answer.question_id}<br>
              <strong>Type:</strong> ${answer.type}<br>
              ${answer.type === 'audio' ? `
                <audio controls src="/api/audio/${answer.storage_path}"></audio><br>
                <a href="/api/audio/${answer.storage_path}" download>Download</a>
              ` : `
                <strong>Content:</strong> <span class="text-content">${answer.text_content || 'N/A'}</span>
                <button class="edit-answer" data-id="${answer.id}">Edit</button>
              `}
              <button class="delete-answer" data-id="${answer.id}">Delete Answer</button>
            </li>
          `).join('')}
        </ul>
      `;

      document.getElementById('edit-submission-form').addEventListener('submit', (e) => {
        e.preventDefault();
        updateSubmission(id);
      });

      document.getElementById('delete-submission').addEventListener('click', () => {
        deleteSubmission(id);
      });

      document.querySelectorAll('.delete-answer').forEach(button => {
        button.addEventListener('click', (e) => {
          deleteAnswer(e.target.dataset.id);
        });
      });

      document.querySelectorAll('.edit-answer').forEach(button => {
        button.addEventListener('click', (e) => {
          editAnswer(e.target.dataset.id);
        });
      });

    } catch (error) {
      console.error('Error fetching submission details:', error);
      alert('Failed to fetch submission details. Please check the console for more details.');
    }
  };

  const editAnswer = (id) => {
    const answerLi = document.getElementById(`answer-${id}`);
    const textSpan = answerLi.querySelector('.text-content');
    const currentText = textSpan.textContent;

    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.addEventListener('click', () => {
      updateAnswer(id, input.value);
    });

    textSpan.replaceWith(input, saveButton);
  };

  const updateAnswer = async (id, text_content) => {
    try {
      const response = await fetch(`/api/answers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text_content }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      alert('Answer updated successfully');
      const submissionId = document.querySelector('#delete-submission').dataset.id;
      renderSubmissionDetails(submissionId);
    } catch (error) {
      console.error('Error updating answer:', error);
      alert('Failed to update answer. Please check the console for more details.');
    }
  };

  const updateSubmission = async (id) => {
    const form = document.getElementById('edit-submission-form');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(`/api/submissions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      alert('Submission updated successfully');
      fetchSubmissions();
      renderSubmissionDetails(id);
    } catch (error) {
      console.error('Error updating submission:', error);
      alert('Failed to update submission. Please check the console for more details.');
    }
  };

  const deleteSubmission = async (id) => {
    if (!confirm('Are you sure you want to delete this submission and all its answers?')) {
      return;
    }

    try {
      const response = await fetch(`/api/submissions/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      alert('Submission deleted successfully');
      detailsContent.innerHTML = '';
      fetchSubmissions();
    } catch (error) {
      console.error('Error deleting submission:', error);
      alert('Failed to delete submission. Please check the console for more details.');
    }
  };

  const deleteAnswer = async (id) => {
    if (!confirm('Are you sure you want to delete this answer?')) {
      return;
    }

    try {
      const response = await fetch(`/api/answers/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      alert('Answer deleted successfully');
      const submissionId = document.querySelector('#delete-submission').dataset.id;
      renderSubmissionDetails(submissionId);
    } catch (error) {
      console.error('Error deleting answer:', error);
      alert('Failed to delete answer. Please check the console for more details.');
    }
  };

  if (submissionsList) {
    fetchSubmissions();
  }
});
