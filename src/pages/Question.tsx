import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AudioRecorder } from "@/components/AudioRecorder";
import { useSurvey } from "@/context/SurveyContext";
import { useNavigate } from "react-router-dom";
import { PenTool, Mic2, ArrowLeft, ArrowRight, MessageCircle, Wand2, Heart, LucideProps } from "lucide-react";
import { useState, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const iconMap: { [key: string]: React.FC<LucideProps> } = {
  MessageCircle,
  Wand2,
  Heart,
};

const Question = ({ questionNumber }: { questionNumber: number }) => {
  const navigate = useNavigate();
  const { responses, updateResponse, questions, loading, submit } = useSurvey();

  const question = useMemo(() => questions[questionNumber - 1], [questions, questionNumber]);

  const current = question ? responses[question.key] : undefined;
  const [mode, setMode] = useState<'text' | 'audio' | null>(null);

  useState(() => {
    if (current?.audio) setMode('audio');
    else if (current?.text) setMode('text');
    else setMode(null);
  }, [current]);

  const isAnswered = !!(current?.text || current?.audio);

  const next = async () => {
    if (questionNumber < questions.length) {
      navigate(`/q/${questionNumber + 1}`);
    } else {
      await submit();
      navigate('/thank-you');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 md:px-6">
        <main className="container max-w-3xl">
          <Card>
            <CardHeader>
              <div className="flex flex-col items-center space-y-4">
                <Skeleton className="w-12 h-12 rounded-full" />
                <Skeleton className="h-8 w-3/4" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Skeleton className="h-12 w-full sm:w-32" />
                <Skeleton className="h-12 w-full sm:w-32" />
              </div>
              <Skeleton className="min-h-40 w-full" />
              <div className="flex flex-col sm:flex-row justify-between gap-3">
                <Skeleton className="h-10 w-full sm:w-24" />
                <Skeleton className="h-10 w-full sm:w-24" />
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!question) {
    return <div>Question not found</div>;
  }

  const { key, title, icon } = question;
  const Icon = iconMap[icon] || MessageCircle;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 md:px-6">
      <main className="container max-w-3xl">
        <Card key={question.id}>
          <CardHeader>
            <div className="flex flex-col items-center space-y-4">
              <Icon className="w-12 h-12 text-primary" />
              <CardTitle className="text-xl md:text-2xl text-center leading-tight">{title}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <fieldset>
              <legend className="sr-only">Escolhe como preferes responder.</legend>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant={mode === 'text' ? 'default' : 'outline'} size="lg" onClick={() => setMode('text')} disabled={mode === 'audio'} className="w-full sm:w-auto">
                  <PenTool className="w-5 h-5 mr-2" /> Escrever
                </Button>
                <Button variant={mode === 'audio' ? 'default' : 'outline'} size="lg" onClick={() => setMode('audio')} disabled={mode === 'text'} className="w-full sm:w-auto">
                  <Mic2 className="w-5 h-5 mr-2" /> Gravar voz
                </Button>
              </div>
            </fieldset>

            {mode === 'text' && (
              <Textarea
                placeholder="Escreve aqui a tua resposta"
                className="min-h-40 bg-card"
                value={current?.text || ''}
                onChange={(e) => updateResponse(key, { text: e.target.value })}
              />
            )}

            {mode === 'audio' && (
              <AudioRecorder
                onAudioReady={(b64) => updateResponse(key, { audio: b64 })}
                audioUrl={current?.audio}
              />
            )}
            <div className="flex flex-col sm:flex-row justify-between gap-3">
              <Button variant="outline" onClick={() => navigate(questionNumber === 1 ? '/demographics/residente' : `/q/${questionNumber - 1}`)} className="w-full sm:w-auto">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Voltar
              </Button>
              <Button variant="default" onClick={next} disabled={!isAnswered} className="w-full sm:w-auto">
                {questionNumber < questions.length ? 'Próxima' : 'Enviar'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Question;
