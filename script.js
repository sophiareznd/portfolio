let engineAtual = null;
let runnerAtual = null;
let corposAtual = [];
const size = 70;
const teclaIds = ['tecla-s', 'tecla-o', 'tecla-a', 'tecla-p', 'tecla-h', 'tecla-i'];
let corpoArrastado = null;
let elArrastado = null;
let teclaArrastando = false;
let teclaLastX = 0;
let teclaLastY = 0;
let teclaOffset = { x: 0, y: 0 };

window.addEventListener('mousemove', e => {
  if (!teclaArrastando || !corpoArrastado || !elArrastado) return;
  const sz = parseInt(elArrastado.style.width);
  elArrastado.style.left = (e.clientX - sz / 2) + 'px';
  elArrastado.style.top  = (e.clientY - sz / 2) + 'px';
  Matter.Body.setPosition(corpoArrastado, { x: e.clientX, y: e.clientY });
});

window.addEventListener('mouseup', () => {
  if (!teclaArrastando || !corpoArrastado) return;
  if (elArrastado) {
    elArrastado.style.animation = '';
    elArrastado.style.cursor = 'grab';
    const sz = parseInt(elArrastado.style.width);
    Matter.Body.setPosition(corpoArrastado, {
      x: parseFloat(elArrastado.style.left) + sz / 2,
      y: parseFloat(elArrastado.style.top)  + sz / 2
    });
  }
  Matter.Body.setAngle(corpoArrastado, 0);
  Matter.Body.setStatic(corpoArrastado, false);
  Matter.Body.setVelocity(corpoArrastado, { x: 0, y: 0 });
  teclaArrastando = false;
  corpoArrastado = null;
  elArrastado = null;
});

window.addEventListener('scroll', () => {
  const nav = document.querySelector('nav');
  if (window.scrollY > 50) {
    nav.classList.add('escondida');
  } else {
    nav.classList.remove('escondida');
  }
});

function iniciarFisica() {
  const { Engine, Runner, Bodies, Body, World, Events } = Matter;

  if (engineAtual) {
    Runner.stop(runnerAtual);
    World.clear(engineAtual.world);
    Engine.clear(engineAtual);
    engineAtual = null;
  }

  const overlayAnt = document.getElementById('teclas-home-overlay');
  if (overlayAnt) overlayAnt.remove();

  const container = document.getElementById('teclas-container');
  if (container) container.style.visibility = 'hidden';

  const overlay = document.createElement('div');
  overlay.id = 'teclas-home-overlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:10;overflow:hidden;';
  document.body.appendChild(overlay);

  const W = window.innerWidth;
  const H = window.innerHeight;
  const sz = 86;

  const engine = Engine.create();
  engine.gravity.y = 3;
  const runner = Runner.create();
  engineAtual = engine;
  runnerAtual = runner;
  Runner.run(runner, engine);

  const chao = Bodies.rectangle(W/2, H + 25, W, 50, { isStatic: true });
  const paredeDir = Bodies.rectangle(W + 25, H/2, 50, H * 3, { isStatic: true });
  const paredeEsq = Bodies.rectangle(-25, H/2, 50, H * 3, { isStatic: true });
  World.add(engine.world, [chao, paredeDir, paredeEsq]);

  const letras = ['s', 'o', 'p', 'h', 'i', 'a'];
  const pares = [];

  letras.forEach((letra, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = W * 0.60 + col * (sz + 100) + Math.random() * 60;
    const y = -150 - row * 350 - Math.random() * 120;
    const angulo = (Math.random() - 0.5) * 2;

    const corpo = Bodies.rectangle(x, y, sz, sz, {
      restitution: 0, friction: 0.9, frictionAir: 0.05, angle: angulo
    });

    const el = document.createElement('img');
    el.src = `imagens/teclas/teclas-${letra}.png`;
    el.style.cssText = `position:absolute;width:${sz}px;cursor:grab;pointer-events:auto;user-select:none;-webkit-user-drag:none;`;
    overlay.appendChild(el);

    el.addEventListener('mousedown', (ev) => {
      Body.setStatic(corpo, true);
      Body.setVelocity(corpo, { x: 0, y: 0 });
      Body.setAngularVelocity(corpo, 0);
      elArrastado = el;
      el.style.cursor = 'grabbing';
      el.style.animation = 'tecla-wiggle 0.4s ease infinite alternate';
      ev.preventDefault();

      const onMove = (ev) => {
        el.style.left = (ev.clientX - sz / 2) + 'px';
        el.style.top  = (ev.clientY - sz / 2) + 'px';
        Body.setPosition(corpo, { x: ev.clientX, y: ev.clientY });
      };
      const onUp = () => {
        el.style.animation = '';
        el.style.cursor = 'grab';
        Body.setPosition(corpo, {
          x: parseFloat(el.style.left) + sz / 2,
          y: parseFloat(el.style.top)  + sz / 2
        });
        Body.setAngle(corpo, 0);
        Body.setStatic(corpo, false);
        Body.setVelocity(corpo, { x: 0, y: 0 });
        elArrastado = null;
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    });

    pares.push({ corpo, el });
    World.add(engine.world, corpo);
  });

  Events.on(engine, 'afterUpdate', () => {
    pares.forEach(({ corpo, el }) => {
      if (el === elArrastado) return;
      el.style.left = (corpo.position.x - sz/2) + 'px';
      el.style.top  = (corpo.position.y - sz/2) + 'px';
      el.style.transform = `rotate(${corpo.angle}rad)`;
    });
  });
}

function mostrarPagina(id) {
  if (id !== 'sobre') {
    chuvaAtiva = false;
    clearTimeout(chuvaTimer);
    const overlay = document.getElementById('teclas-sobre-container');
    if (overlay) overlay.remove();
  }
  if (id !== 'home') {
    const homeOverlay = document.getElementById('teclas-home-overlay');
    if (homeOverlay) homeOverlay.remove();
    if (engineAtual) {
      Matter.Runner.stop(runnerAtual);
      Matter.World.clear(engineAtual.world);
      Matter.Engine.clear(engineAtual);
      engineAtual = null;
    }
  }

  document.querySelectorAll('.pagina').forEach(p => p.classList.remove('ativa'));
  document.getElementById(id).classList.add('ativa');
  document.querySelectorAll('nav ul li a').forEach(a => a.classList.remove('ativa'));
  if (event && event.target) event.target.classList.add('ativa');
  if (id === 'home') {
    document.body.classList.add('home-ativa');
    iniciarFisica();
  } else {
    document.body.classList.remove('home-ativa');
  }
}

const projetos = [
  {
    id: 'cosmo',
    titulo: 'Cosmo Font',
    ano: '2025',
    areas: 'Tipografia, editorial, branding',
    areas_en: 'Typography, editorial, branding',
    descricao: 'Cosmo é uma tipografia serifada condensada desenvolvida ao longo de um semestre inteiro, do estudo de princípios até a construção no Glyphs. O processo começou à mão, com muitos testes e explorações até a definição da direção formal, com orientação do designer tipográfico Leopoldo Leal.<br><br>A inspiração parte das taças de coquetel, traduzida em serifas alongadas, detalhes afiados e contraste médio. O resultado é uma fonte que une precisão geométrica e sofisticação.',
    descricao_en: 'Cosmo is a condensed serif typeface developed over an entire semester, from studying principles to building it in Glyphs. The process started by hand, with many tests and explorations until the formal direction was defined, under the guidance of typographic designer Leopoldo Leal.<br><br>The inspiration comes from cocktail glasses, translated into elongated serifs, sharp details, and medium contrast. The result is a typeface that combines geometric precision and sophistication, applied to a fictional brand universe built especially for it.',
    imagens: [
      'imagens/projetos/cosmo/fotos-01.jpg',
      'imagens/projetos/cosmo/fotos-02.jpg',
      'imagens/projetos/cosmo/fotos-03.jpg',
      'imagens/projetos/cosmo/fotos-04.jpg',
      'imagens/projetos/cosmo/fotos-05.jpg',
      'imagens/projetos/cosmo/fotos-06.jpg',
      'imagens/projetos/cosmo/fotos-07.jpg',
      'imagens/projetos/cosmo/fotos-08.jpg',
      'imagens/projetos/cosmo/fotos-09.jpg'
    ]
  },
  {
    id: 'maismais',
    titulo: 'REVISTA ++',
    ano: '2025',
    areas: 'Editorial, branding, marketing',
    areas_en: 'Editorial, branding, marketing',
    descricao: '++ (mais mais) é uma revista impressa criada a partir do tema consumo, desenvolvida com base em pesquisas extensas de público-alvo, incluindo mapa de empatia, formulários aplicados em pontos frequentados pelo público-alvo, análise PESTEL, pesquisa de concorrência e tabela de conteúdo comparativa. O desafio era questionar tanto o valor quanto o modo como a geração Z consome informação digitalmente, e a resposta foi uma publicação que propõe o oposto do feed: desacelerar, ler com intenção, ficar com o que realmente importa.<br><br>O projeto foi premiado na Mostra Estudantil da ESPM, que reconhece os melhores trabalhos do curso durante o ano. O nome parte da repetição para provocar. O símbolo ++ evoca o excesso da era digital e, ao mesmo tempo, propõe uma ruptura: não mais do mesmo, mas mais consciência, mais qualidade, mais intenção. A revista não é contra o consumo digital, mas contra o consumo acelerado e sem reflexão. Por ser impressa, existe como objeto desejado por si só, um investimento de tempo e atenção em um contexto onde a leitura virou distração.',
    descricao_en: '++ (mais mais) is a printed magazine created around the theme of consumption, developed based on extensive target-audience research, including empathy mapping, questionnaires applied at locations frequented by the target audience, PESTEL analysis, competitive research, and comparative content tables. The challenge was to question both the value and the way Generation Z consumes information digitally, and the answer was a publication that proposes the opposite of the feed: slow down, read with intention, keep what truly matters.<br><br>The project won an award at the ESPM Student Exhibition, which recognizes the best works of the year. The name plays on repetition to provoke. The ++ symbol evokes the excess of the digital era while simultaneously proposing a rupture: not more of the same, but more awareness, more quality, more intention. The magazine is not against digital consumption, but against accelerated and unreflective consumption. As a printed object, it exists as something desirable in itself — an investment of time and attention in a context where reading has become distraction.',
    imagens: [
      'imagens/projetos/maismais/fotos-01.png',
      'imagens/projetos/maismais/fotos-02.png',
      'imagens/projetos/maismais/fotos-03.png',
      'imagens/projetos/maismais/fotos-04.png',
      'imagens/projetos/maismais/fotos-05.jpg',
      'imagens/projetos/maismais/fotos-06.png',
      'imagens/projetos/maismais/fotos-07.png',
      'imagens/projetos/maismais/fotos-08.png',
      'imagens/projetos/maismais/fotos-09.png',
      'imagens/projetos/maismais/fotos-10.png'
    ]
  },
  {
    id: 'kitkat',
    titulo: 'KitKat Sugar Rush',
    ano: '2025',
    areas: 'Embalagem, branding',
    areas_en: 'Packaging, branding',
    descricao: 'KitKat Sugar Rush é uma linha de produto desenvolvida a partir de um briefing real da Nestlé, apresentado na ESPM. O desafio era criar uma linha ValueUp para o varejo com identidade visual voltada para a geração Z, respeitando as diretrizes e os valores da marca.<br><br>O conceito parte da adrenalina do açúcar como experiência sensorial: halftone, círculos vibrantes e fotografias reais das sobremesas criam um apelo visual imediato que equilibra energia e refinamento. O sistema se expande da embalagem individual ao tablete, ao PDV e à comunicação OOH.',
    descricao_en: 'KitKat Sugar Rush is a product line developed from a real Nestlé brief presented at ESPM. The challenge was to create a ValueUp line for retail with a visual identity aimed at Generation Z, while respecting the brand\'s guidelines and values.<br><br>The concept stems from the adrenaline of sugar as a sensory experience: halftone patterns, vibrant circles, and real photographs of the desserts create immediate visual appeal that balances energy and refinement. The system expands from individual packaging to the tablet, POS, and OOH communication.',
    imagens: [
      'imagens/projetos/kitkat/fotos-01.jpg',
      'imagens/projetos/kitkat/fotos-02.jpg',
      'imagens/projetos/kitkat/fotos-03.jpg',
      'imagens/projetos/kitkat/fotos-04.jpg',
      'imagens/projetos/kitkat/fotos-05.jpg',
      'imagens/projetos/kitkat/fotos-06.jpg',
      'imagens/projetos/kitkat/fotos-07.jpg',
      'imagens/projetos/kitkat/fotos-08.jpg',
      'imagens/projetos/kitkat/fotos-09.jpg'
    ]
  },
  {
    id: 'ama',
    titulo: 'AMA',
    ano: '2024',
    areas: 'Branding, identidade visual, design social',
    areas_en: 'Branding, visual identity, social design',
    descricao: 'A AMA (Associação de Amigos do Autista) é uma entidade sem fins lucrativos criada por um grupo de pais para oferecer apoio e acolhimento a famílias de pessoas autistas. O projeto foi uma reformulação da identidade visual existente, com foco em sensibilidade e humanidade.<br><br>A partir do conceito de peças que se conectam, o sistema gráfico representa a diversidade dentro do espectro e a construção coletiva do cuidado: diferentes formas, diferentes ritmos, diferentes necessidades.',
    descricao_en: 'AMA (Friends of the Autistic Association) is a non-profit organization founded by a group of parents to provide support and care to families of autistic individuals. The project was a redesign of the existing visual identity, focused on sensitivity and humanity.<br><br>From the concept of pieces that connect, the graphic system represents diversity within the spectrum and the collective construction of care: different shapes, different rhythms, different needs.',
    imagens: [
      'imagens/projetos/ama/fotos-01.jpg',
      'imagens/projetos/ama/fotos-02.jpg',
      'imagens/projetos/ama/fotos-03.jpg',
      'imagens/projetos/ama/fotos-04.jpg'
    ]
  },
  {
    id: 'sinapse',
    titulo: 'Sinapse',
    ano: '2026',
    areas: 'Web design, design de experiência, design de informação',
    areas_en: 'Web design, experience design, information design',
    descricao: 'Sinapse é um site sobre São Paulo através dos cinco sentidos. O projeto parte do excesso de estímulos que a cidade produz e propõe uma navegação que convida à reflexão sobre tudo o que sentimos ao existir nela.<br><br>Mais do que um site sobre SP, é uma experiência que usa a estrutura do próprio meio digital para questionar como percebemos o espaço urbano ao redor.<br><br>Confira o site!<br><a href="https://sinapse-gdwu.vercel.app/" target="_blank" style="color:#0e1ae8;text-decoration:none;">https://sinapse-gdwu.vercel.app/</a>',
    descricao_en: 'Sinapse is a website about São Paulo through the five senses. The project stems from the excess of stimuli the city produces and proposes a navigation that invites reflection on everything we feel while existing within it.<br><br>More than a website about SP, it is an experience that uses the structure of the digital medium itself to question how we perceive the urban space around us.<br><br>Check it out!<br><a href="https://sinapse-gdwu.vercel.app/" target="_blank" style="color:#0e1ae8;text-decoration:none;">https://sinapse-gdwu.vercel.app/</a>',
    imagens: [
      'imagens/projetos/sinapse/foto-01.jpg',
      'imagens/projetos/sinapse/foto-02.jpg',
      'imagens/projetos/sinapse/foto-03.jpg',
      'imagens/projetos/sinapse/foto-04.jpg',
      'imagens/projetos/sinapse/foto-05.jpg',
      'imagens/projetos/sinapse/foto-06.jpg'
    ]
  },
  {
    id: 'anjos',
    titulo: 'Anjos e Fadas',
    ano: '2025-atualmente',
    areas: 'Social media, design digital, comunicação',
    areas_en: 'Social media, digital design, communication',
    descricao: 'Anjos & Fadas é uma organização independente de proteção animal localizada no Brooklin, em São Paulo. Como social media voluntária, desenvolvo peças digitais voltadas para divulgação, campanhas de adoção, arrecadação e fortalecimento da presença online da instituição.<br><br>O trabalho parte da identidade visual já existente e busca criar uma comunicação consistente e afetiva, capaz de engajar o público e ampliar o alcance da causa.',
    descricao_en: 'Anjos & Fadas is an independent animal protection organization located in Brooklin, São Paulo. As a volunteer social media designer, I develop digital pieces for outreach, adoption campaigns, fundraising, and strengthening the institution\'s online presence.<br><br>The work builds on the existing visual identity and aims to create consistent and affective communication, capable of engaging the audience and broadening the reach of the cause.',
    imagens: [
      'imagens/projetos/anjosefadas/fotos-01.jpg',
      'imagens/projetos/anjosefadas/fotos-02.jpg',
      'imagens/projetos/anjosefadas/fotos-03.jpg',
      'imagens/projetos/anjosefadas/fotos-04.jpg'
    ]
  },
  {
    id: 'emilie',
    titulo: 'Premiação Emilie Chamie e Mostra Estudantil',
    ano: '2025',
    areas: 'Identidade visual, design gráfico',
    areas_en: 'Visual identity, graphic design',
    descricao: 'Proposta de identidade visual para dois eventos do curso de Design da ESPM que acontecem no mesmo dia: a Mostra Estudantil, que premia os melhores trabalhos do ano, e o Prêmio Emilie Chamie, uma premiação dos melhores PGDs em homenagem à pioneira do design paulista.<br><br>O conceito parte de degradês formados por muitas cores, representando alunos, ideias e criatividade coexistindo dentro do curso. Nos dois pôsteres, a organização dos degradês muda: mais estruturada para o Emilie Chamie, mais fragmentada para a Mostra, refletindo os diferentes momentos da trajetória acadêmica.',
    descricao_en: 'Visual identity proposal for two events of the ESPM Design program that take place on the same day: the Student Exhibition, which awards the best works of the year, and the Emilie Chamie Prize, an award for the best PGDs in honor of the pioneer of São Paulo design.<br><br>The concept stems from gradients formed by many colors, representing students, ideas, and creativity coexisting within the program. In the two posters, the organization of the gradients changes: more structured for the Emilie Chamie, more fragmented for the Exhibition, reflecting the different moments of the academic journey.',
    imagens: [
      'imagens/projetos/emilie/fotos-01.jpg',
      'imagens/projetos/emilie/fotos-02.jpg',
      'imagens/projetos/emilie/fotos-03.jpg'
    ]
  },
  {
    id: 'jagerbomb',
    titulo: 'Jägerbomb',
    ano: '2025',
    areas: 'Identidade visual, branding',
    areas_en: 'Visual identity, branding',
    descricao: 'Jägerbomb é uma identidade visual desenvolvida para uma banda independente que carrega a mesma energia do drink que inspira seu nome: Jägermeister com Red Bull. A proposta foi traduzir esse conceito em um sistema gráfico intenso, direto e explosivo.<br><br>O resultado combina atitude e impacto visual em uma identidade que funciona tanto nos materiais digitais quanto nas aplicações físicas da banda.',
    descricao_en: 'Jägerbomb is a visual identity developed for an independent band that carries the same energy as the drink that inspired its name: Jägermeister with Red Bull. The goal was to translate this concept into an intense, direct, and explosive graphic system.<br><br>The result combines attitude and visual impact in an identity that works both in digital materials and in the band\'s physical applications.',
    imagens: [
      'imagens/projetos/jagerbomb/fotos-01.jpg',
      'imagens/projetos/jagerbomb/fotos-02.jpg',
      'imagens/projetos/jagerbomb/fotos-03.jpg',
      'imagens/projetos/jagerbomb/fotos-04.jpg'
    ]
  },
  {
    id: 'seposicione',
    titulo: 'SePosicione',
    ano: '2025',
    areas: 'Design ambiental, design de experiência',
    areas_en: 'Environmental design, experience design',
    descricao: 'O Minhocão carrega questões complexas sobre seu futuro: demolição, gentrificação, insalubridade. Construído durante a ditadura militar sem diálogo com a população afetada, o espaço evidencia a importância do debate público sobre a cidade.<br><br>A intervenção propõe placas de LED nas empenas de prédios visíveis do Elevado, conectadas a um tapete interativo no chão. À medida que os passantes caminham, seus passos se traduzem em pegadas coloridas sobre as palavras exibidas nas telas, tangibilizando a presença de cada indivíduo e reforçando que todos que ocupam a cidade também participam de sua transformação.',
    descricao_en: 'The Minhocão carries complex questions about its future: demolition, gentrification, unhealthy conditions. Built during the military dictatorship without dialogue with the affected population, the space highlights the importance of public debate about the city.<br><br>The intervention proposes LED panels on the façades of buildings visible from the Elevated, connected to an interactive floor mat. As passersby walk, their steps translate into colorful footprints over the words displayed on the screens, making each individual\'s presence tangible and reinforcing that everyone who occupies the city also participates in its transformation.',
    imagens: [
      'imagens/projetos/seposicione/fotos-01.jpg',
      'imagens/projetos/seposicione/fotos-02.jpg',
      'imagens/projetos/seposicione/fotos-03.jpg',
      'imagens/projetos/seposicione/fotos-04.jpg'
    ]
  }
];

let projetoAtualIndex = 0;

function abrirProjeto(id) {
  const index = projetos.findIndex(p => p.id === id);
  if (index === -1) return;
  projetoAtualIndex = index;
  renderizarProjeto();
  mostrarPagina('projeto-aberto');
}

function renderizarProjeto() {
  const p = projetos[projetoAtualIndex];
  document.getElementById('projeto-titulo').textContent = p.titulo;
  document.getElementById('projeto-ano').textContent = p.ano;
  document.getElementById('projeto-areas').innerHTML = idioma === 'en' ? p.areas_en : p.areas;
  document.getElementById('projeto-desc').innerHTML = idioma === 'en' ? p.descricao_en : p.descricao;

  const container = document.getElementById('projeto-imagens');
  container.innerHTML = '';
  container.scrollTop = 0;
  p.imagens.forEach(src => {
    const img = document.createElement('img');
    img.src = src;
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => abrirLightbox(src));
    container.appendChild(img);
  });
}

function abrirLightbox(src) {
  document.getElementById('lightbox-img').src = src;
  document.getElementById('lightbox').classList.add('ativo');
}

function fecharLightbox() {
  document.getElementById('lightbox').classList.remove('ativo');
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') fecharLightbox();
});

function navegarProjeto(direcao) {
  projetoAtualIndex = (projetoAtualIndex + direcao + projetos.length) % projetos.length;
  renderizarProjeto();
}

let engineSobre = null;
let runnerSobre = null;
let corposSobre = [];
let chaoSobre = null;
let chuvaTimer = null;
let chuvaAtiva = false;

function chuvaDeTecias() {
  const { Engine, Runner, Bodies, Body, World, Events } = Matter;

  // Cancela timers anteriores
  clearTimeout(chuvaTimer);

  const anterior = document.getElementById('teclas-sobre-container');
  if (anterior) anterior.remove();
  if (engineSobre) {
    Runner.stop(runnerSobre);
    World.clear(engineSobre.world);
    Engine.clear(engineSobre);
  }

  if (!document.getElementById('sobre').classList.contains('ativa')) return;
  chuvaAtiva = true;

  const overlay = document.createElement('div');
  overlay.id = 'teclas-sobre-container';
  overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:50;overflow:hidden;';
  document.body.appendChild(overlay);

  const W = window.innerWidth;
  const H = window.innerHeight;

  const engine = Engine.create();
  engine.gravity.y = 3;
  const runner = Runner.create();
  engineSobre = engine;
  runnerSobre = runner;
  Runner.run(runner, engine);

  chaoSobre = Bodies.rectangle(W / 2, H + 25, W, 50, { isStatic: true });
  const paredeDir = Bodies.rectangle(W + 25, H / 2, 50, H * 3, { isStatic: true });
  const paredeEsq = Bodies.rectangle(-25, H / 2, 50, H * 3, { isStatic: true });
  World.add(engine.world, [chaoSobre, paredeDir, paredeEsq]);

  const letras = ['s', 'o', 'p', 'h', 'i', 'a'];
  const size = 60;
  corposSobre = [];

  for (let i = 0; i < 105; i++) {
    const letra = letras[i % letras.length];
    const x = Math.random() * (W - 120) + 60;
    const y = -80 - i * 30;
    const angulo = (Math.random() - 0.5) * 2;

    const corpo = Bodies.rectangle(x, y, size, size, {
      restitution: 0, friction: 0.9, frictionAir: 0.05, angle: angulo
    });

    const el = document.createElement('img');
    el.src = `imagens/teclas/teclas-${letra}.png`;
    el.style.cssText = `position:absolute;width:${size}px;cursor:grab;pointer-events:auto;user-select:none;-webkit-user-drag:none;`;
    overlay.appendChild(el);

    el.addEventListener('mousedown', (e) => {
      teclaArrastando = true;
      teclaLastX = e.clientX;
      teclaLastY = e.clientY;
      corpoArrastado = corpo;
      elArrastado = el;
      Body.setStatic(corpo, true);
      Body.setVelocity(corpo, { x: 0, y: 0 });
      Body.setAngularVelocity(corpo, 0);
      el.style.cursor = 'grabbing';
      el.style.transition = 'transform 0.15s ease';
      el.style.transform = 'rotate(0deg)';
      setTimeout(() => {
        el.style.transition = '';
        el.style.animation = 'tecla-wiggle 0.4s ease infinite alternate';
      }, 150);
      e.preventDefault();
    });

    corposSobre.push({ corpo, el });
    World.add(engine.world, corpo);
  }

  Events.on(engine, 'afterUpdate', () => {
    corposSobre.forEach(({ corpo, el }) => {
      if (el === elArrastado) return;
      el.style.left = (corpo.position.x - size / 2) + 'px';
      el.style.top  = (corpo.position.y - size / 2) + 'px';
      el.style.transform = `rotate(${corpo.angle}rad)`;
    });
  });

  // Detecta quando todas as teclas pararam e abre o chão após 3s
  const checkSettled = setInterval(() => {
    if (!chuvaAtiva) { clearInterval(checkSettled); return; }
    const todasParadas = corposSobre.every(({ corpo }) =>
      Math.abs(corpo.velocity.x) < 0.5 && Math.abs(corpo.velocity.y) < 0.5 && corpo.position.y > 0
    );
    if (todasParadas) {
      clearInterval(checkSettled);
      chuvaTimer = setTimeout(() => abrirChao(), 7000);
    }
  }, 500);

  // Fallback: garante que o chão abre mesmo em mobile onde a física pode travar
  setTimeout(() => {
    if (chuvaAtiva) {
      clearInterval(checkSettled);
      clearTimeout(chuvaTimer);
      abrirChao();
    }
  }, 9000);
}

function abrirChao() {
  if (!engineSobre || !chaoSobre) return;
  // Remove o chão — teclas caem para fora da tela
  Matter.World.remove(engineSobre.world, chaoSobre);
  chaoSobre = null;
  // Teclas fixadas: remove do loop afterUpdate e anima via CSS
  setTimeout(() => {
    corposSobre = corposSobre.filter(({ corpo, el }) => {
      if (corpo.isStatic && corpo !== corpoArrastado) {
        el.style.transition = 'top 1.2s ease-in';
        el.style.top = (window.innerHeight + 120) + 'px';
        return false;
      }
      return true;
    });
  }, 300);
  // Remove overlay após teclas saírem da tela
  chuvaTimer = setTimeout(() => {
    const overlay = document.getElementById('teclas-sobre-container');
    if (overlay) overlay.remove();
    if (engineSobre) {
      Matter.Runner.stop(runnerSobre);
      Matter.World.clear(engineSobre.world);
      Matter.Engine.clear(engineSobre);
      engineSobre = null;
    }
  }, 2500);
}

let idioma = 'pt';

function alternarIdioma() {
  idioma = idioma === 'pt' ? 'en' : 'pt';
  const btn = event.target;
  btn.textContent = idioma === 'pt' ? 'PT-BR' : 'ENG';

  document.querySelectorAll('[data-pt][data-en]').forEach(el => {
    const texto = idioma === 'pt' ? el.dataset.pt : el.dataset.en;
    el.innerHTML = texto;
  });

  if (document.getElementById('projeto-aberto').classList.contains('ativa')) {
    renderizarProjeto();
  }
}

document.body.classList.add('home-ativa');
iniciarFisica();