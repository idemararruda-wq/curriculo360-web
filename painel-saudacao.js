const messages = [
  'Que seu dia seja leve e produtivo. Uma boa conversa pode aproximar alguém da oportunidade que estava esperando.',
  'Confie no seu olhar e na sua escuta. Cada ficha bem analisada ajuda você a encontrar a pessoa certa para a vaga.',
  'Se o dia estiver puxado, escolha uma tarefa de cada vez. Um retorno dado com atenção já é um bom começo.',
  'Que hoje você consiga avançar nas vagas que mais precisam de você. Valorize também os pequenos progressos.',
  'Você tem experiência, curiosidade e capacidade de aprender. Leve essas três coisas para a próxima entrevista.',
  'Tenha confiança no seu trabalho. Um processo claro ajuda a empresa a decidir e o candidato a seguir em frente.',
  'Abra espaço para boas surpresas. Uma pergunta bem feita pode revelar uma experiência que o currículo resumiu em uma linha.',
  'Seu trabalho abre portas. Que hoje você encontre boas conexões e termine o dia reconhecendo o que fez bem.',
  'Acredite no que você é capaz de construir. Cada processo conduzido com cuidado fortalece a profissional que você está se tornando.',
  'Que hoje tenha entrevistas boas, retornos claros e motivos para comemorar. Comece pelo que está ao seu alcance.'
];

const clock = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'America/Sao_Paulo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  hourCycle: 'h23'
});

export function dailyGreeting(name, now = new Date()) {
  const parts = Object.fromEntries(clock.formatToParts(now).map(({ type, value }) => [type, value]));
  const hour = Number(parts.hour);
  const period = hour < 12 && hour >= 5 ? 'Bom dia' : hour >= 12 && hour < 18 ? 'Boa tarde' : 'Boa noite';
  const day = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)) / 86400000;
  const firstName = String(name ?? '').trim().split(/\s+/)[0];
  return {
    title: firstName ? `${period}, ${firstName}!` : `${period}!`,
    message: messages[day % messages.length]
  };
}
