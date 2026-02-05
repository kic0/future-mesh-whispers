import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Terms = () => {
  return (
    <div className="pt-20 px-6">
      <main className="container max-w-3xl">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-3xl">Termos e condições de participação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-lg">
            <p>• Os meus depoimentos serão registados anonimamente.</p>
            <p>• A informação recolhida pode ser usada em atividades educativas e culturais.</p>
            <p>• Poderei desistir a qualquer momento.</p>
            <p>Mais informação sobre o âmbito do projeto em futuroemrede.com</p>
            <div className="flex gap-4 pt-4">
              <Button variant="hero" size="lg" asChild>
                <a href="/demographics/genero">Aceito</a>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="/">Voltar</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Terms;
