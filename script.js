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
  const sz = W < 768 ? 75 : 86;

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
    const x = W < 768
      ? W * 0.15 + col * (sz + 24) + Math.random() * 20
      : W * 0.60 + col * (sz + 100) + Math.random() * 60;
    const y = W < 768
      ? -80 - row * 200 - Math.random() * 60
      : -150 - row * 350 - Math.random() * 120;
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
  // currículo só aparece quando pedem (palavra "Currículo"); trocar de aba guarda
  cvIr('escondido');
  // vídeos das capas só começam a baixar quando a aba Projetos é aberta
  if (id === 'projetos') carregarAdiados(document.getElementById('projetos'));
}

const projetos = [
  {
    id: 'cosmo',
    titulo: 'Cosmo Font',
    ano: '2025',
    subtitulo: 'Tipografia inspirada em taças de coquetel',
    subtitulo_en: 'A typeface inspired by cocktail glasses',
    meta: [
      { pt: 'Ano', en: 'Year', valor: '2025' },
      { pt: 'Instituição', en: 'School', valor: 'ESPM São Paulo' },
      { pt: 'Orientação', en: 'Advisor', valor: 'Leopoldo Leal' },
      { pt: 'Créditos', en: 'Credits', valor: 'Sophia Rezende' }
    ],
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
    titulo: 'Revista ++',
    ano: '2025',
    subtitulo: 'Revista impressa sobre consumo digital',
    subtitulo_en: 'A printed magazine about digital consumption',
    meta: [
      { pt: 'Ano', en: 'Year', valor: '2025' },
      { pt: 'Instituição', en: 'School', valor: 'ESPM São Paulo' },
      { pt: 'Reconhecimento', en: 'Recognition', valor: 'Mostra Estudantil ESPM', valor_en: 'ESPM Student Exhibition' },
      { pt: 'Créditos', en: 'Credits', valor: 'Dara Mielnik<br>Fernanda Casagrande<br>Gabriela Nacif<br>Juliana Nakashima<br>Sophia Rezende' },
      { pt: 'Orientação', en: 'Advisor', valor: 'Marise De Chirico' }
    ],
    areas: 'Editorial, branding, marketing',
    areas_en: 'Editorial, branding, marketing',
    descricao: '++ (mais mais) é uma revista impressa criada a partir do tema consumo, desenvolvida com base em pesquisas extensas de público-alvo, incluindo mapa de empatia, formulários aplicados em pontos frequentados pelo público-alvo, análise PESTEL, pesquisa de concorrência e tabela de conteúdo comparativa. O desafio era questionar tanto o valor quanto o modo como a geração Z consome informação digitalmente, e a resposta foi uma publicação que propõe o oposto do feed: desacelerar, ler com intenção, ficar com o que realmente importa.<br><br>O projeto foi premiado na Mostra Estudantil da ESPM, que reconhece os melhores trabalhos do curso durante o ano. O nome parte da repetição para provocar. O símbolo ++ evoca o excesso da era digital e, ao mesmo tempo, propõe uma ruptura: não mais do mesmo, mas mais consciência, mais qualidade, mais intenção. A revista não é contra o consumo digital, mas contra o consumo acelerado e sem reflexão. Por ser impressa, existe como objeto desejado por si só, um investimento de tempo e atenção em um contexto onde a leitura virou distração.',
    descricao_en: '++ (mais mais) is a printed magazine created around the theme of consumption, developed based on extensive target-audience research, including empathy mapping, questionnaires applied at locations frequented by the target audience, PESTEL analysis, competitive research, and comparative content tables. The challenge was to question both the value and the way Generation Z consumes information digitally, and the answer was a publication that proposes the opposite of the feed: slow down, read with intention, keep what truly matters.<br><br>The project won an award at the ESPM Student Exhibition, which recognizes the best works of the year. The name plays on repetition to provoke. The ++ symbol evokes the excess of the digital era while simultaneously proposing a rupture: not more of the same, but more awareness, more quality, more intention. The magazine is not against digital consumption, but against accelerated and unreflective consumption. As a printed object, it exists as something desirable in itself — an investment of time and attention in a context where reading has become distraction.',
    imagens: [
      'imagens/projetos/maismais/fotos-01.webp',
      'imagens/projetos/maismais/video-02-digitacao.mp4',
      { src: 'imagens/projetos/maismais/fotos-revista-aberta.jpg', menor: true },
      'imagens/projetos/maismais/fotos-02.jpg',
      ['imagens/projetos/maismais/fotos-03.jpg', 'imagens/projetos/maismais/fotos-04.jpg'],
      'imagens/projetos/maismais/video-grid.mp4',
      'imagens/projetos/maismais/fotos-leitura.jpg',
      'imagens/projetos/maismais/fotos-outdoor.jpg',
      { src: 'imagens/projetos/maismais/fotos-caminhando.jpg', menor: true },
      'imagens/projetos/maismais/video-01.mp4',
      { revista: 'imagens/projetos/maismais/revista', paginas: 108, tamanho: [500, 625] }
    ]
  },
  {
    id: 'kitkat',
    titulo: 'KitKat Sugar Rush',
    ano: '2025',
    subtitulo: 'Linha de produtos ValueUp para a Nestlé',
    subtitulo_en: 'ValueUp product line for Nestlé',
    meta: [
      { pt: 'Ano', en: 'Year', valor: '2025' },
      { pt: 'Instituição', en: 'School', valor: 'ESPM São Paulo' },
      { pt: 'Orientação', en: 'Advisor', valor: 'Cláudia Weber' },
      { pt: 'Créditos', en: 'Credits', valor: 'Ana Beatriz Gomes<br>Beatriz Sin<br>Fernanda Casagrande<br>Sophia Rezende' }
    ],
    areas: 'Embalagem, branding',
    areas_en: 'Packaging, branding',
    descricao: 'KitKat Sugar Rush é uma linha de produto desenvolvida a partir de um briefing real da Nestlé, apresentado na ESPM. O desafio era criar uma linha ValueUp para o varejo com identidade visual voltada para a geração Z, respeitando as diretrizes e os valores da marca.<br><br>O conceito parte da adrenalina do açúcar como experiência sensorial: halftone, círculos vibrantes e fotografias reais das sobremesas criam um apelo visual imediato que equilibra energia e refinamento. O sistema se expande da embalagem individual ao tablete, ao PDV e à comunicação OOH.',
    descricao_en: 'KitKat Sugar Rush is a product line developed from a real Nestlé brief presented at ESPM. The challenge was to create a ValueUp line for retail with a visual identity aimed at Generation Z, while respecting the brand\'s guidelines and values.<br><br>The concept stems from the adrenaline of sugar as a sensory experience: halftone patterns, vibrant circles, and real photographs of the desserts create immediate visual appeal that balances energy and refinement. The system expands from individual packaging to the tablet, POS, and OOH communication.',
    imagens: [
      'imagens/projetos/kitkat/fotos-01.jpg',
      'imagens/projetos/kitkat/fotos-02.jpg',
      { src: 'imagens/projetos/kitkat/video-sugar-rush-quadrado.mp4', largura: 66.67 },
      'imagens/projetos/kitkat/fotos-06.jpg',
      'imagens/projetos/kitkat/fotos-07.jpg',
      'imagens/projetos/kitkat/fotos-08.jpg',
      'imagens/projetos/kitkat/fotos-03.jpg'
    ]
  },
  {
    id: 'ama',
    titulo: 'AMA',
    ano: '2024',
    subtitulo: 'Nova identidade visual para uma associação de apoio a pessoas autistas',
    subtitulo_en: 'A new visual identity for an association supporting autistic people',
    meta: [
      { pt: 'Ano', en: 'Year', valor: '2024' },
      { pt: 'Instituição', en: 'School', valor: 'ESPM São Paulo' },
      { pt: 'Orientação', en: 'Advisor', valor: 'Leopoldo Leal' },
      { pt: 'Créditos', en: 'Credits', valor: 'Ana Beatriz Gomes<br>Bárbara Luiza Troncoso<br>Beatriz Sin<br>Fernanda Casagrande<br>Sophia Rezende<br>Sue Elizabeth' }
    ],
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
    subtitulo: 'Site experimental sobre São Paulo através dos cinco sentidos',
    subtitulo_en: 'An experimental website about São Paulo through the five senses',
    meta: [
      { pt: 'Ano', en: 'Year', valor: '2026' },
      { pt: 'Instituição', en: 'School', valor: 'ESPM São Paulo' },
      { pt: 'Orientação', en: 'Advisor', valor: 'Danilo Cid' },
      { pt: 'Créditos', en: 'Credits', valor: 'Ana Beatriz Gomes<br>Beatriz Sin<br>Dara Mielnik<br>Fernanda Casagrande<br>Gabriela Nacif<br>Juliana Nakashima<br>Sophia Rezende' }
    ],
    areas: 'Web design, design de experiência, design de informação',
    areas_en: 'Web design, experience design, information design',
    descricao: 'Sinapse é um site sobre São Paulo através dos cinco sentidos. O projeto parte do excesso de estímulos que a cidade produz e propõe uma navegação que convida à reflexão sobre tudo o que sentimos ao existir nela.<br><br>Mais do que um site sobre SP, é uma experiência que usa a estrutura do próprio meio digital para questionar como percebemos o espaço urbano ao redor.<br><br>Confira o site!<br><a href="https://sinapse-gdwu.vercel.app/" target="_blank" style="color:#0e1ae8;text-decoration:none;">https://sinapse-gdwu.vercel.app/</a>',
    descricao_en: 'Sinapse is a website about São Paulo through the five senses. The project stems from the excess of stimuli the city produces and proposes a navigation that invites reflection on everything we feel while existing within it.<br><br>More than a website about SP, it is an experience that uses the structure of the digital medium itself to question how we perceive the urban space around us.<br><br>Check it out!<br><a href="https://sinapse-gdwu.vercel.app/" target="_blank" style="color:#0e1ae8;text-decoration:none;">https://sinapse-gdwu.vercel.app/</a>',
    imagens: [
      'imagens/projetos/sinapse/foto-01.jpg',
      'imagens/projetos/sinapse/foto-banca.jpg',
      { src: 'imagens/projetos/sinapse/video-mistura.mp4', largura: 66.67 },
      'imagens/projetos/sinapse/foto-cartazes-sombra.jpg',
      'imagens/projetos/sinapse/foto-metro.jpg',
      { src: 'imagens/projetos/sinapse/video-parede.mp4', largura: 35 },
      'imagens/projetos/sinapse/video-site.mp4'
    ]
  },
  {
    id: 'anjos',
    titulo: 'Anjos e Fadas',
    ano: '2026–atualmente',
    subtitulo: 'Social media voluntária para uma organização de proteção animal',
    subtitulo_en: 'Volunteer social media for an animal protection organization',
    meta: [
      { pt: 'Ano', en: 'Year', valor: '2026–atualmente', valor_en: '2026–present' },
      { pt: 'Créditos', en: 'Credits', valor: 'Sophia Rezende' },
      { pt: 'Instituição', en: 'Organization', valor: 'Abrigo Anjos e Fadas', valor_en: 'Anjos e Fadas Shelter' }
    ],
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
    subtitulo: 'Identidade visual para dois eventos do curso de Design da ESPM',
    subtitulo_en: 'Visual identity for two events of the ESPM Design program',
    meta: [
      { pt: 'Ano', en: 'Year', valor: '2025' },
      { pt: 'Instituição', en: 'School', valor: 'ESPM São Paulo' },
      { pt: 'Orientação', en: 'Advisor', valor: 'Leopoldo Leal' },
      { pt: 'Créditos', en: 'Credits', valor: 'Sophia Rezende' }
    ],
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
    subtitulo: 'Identidade visual para uma banda independente',
    subtitulo_en: 'Visual identity for an independent band',
    meta: [
      { pt: 'Ano', en: 'Year', valor: '2025' },
      { pt: 'Créditos', en: 'Credits', valor: 'Sophia Rezende' }
    ],
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
    subtitulo: 'Intervenção urbana interativa sobre o futuro do Minhocão',
    subtitulo_en: 'An interactive urban intervention about the future of the Minhocão',
    meta: [
      { pt: 'Ano', en: 'Year', valor: '2025' },
      { pt: 'Instituição', en: 'School', valor: 'ESPM São Paulo' },
      { pt: 'Orientação', en: 'Advisor', valor: 'Daniel Trench' },
      { pt: 'Créditos', en: 'Credits', valor: 'Dara Mielnik<br>Fernanda Casagrande<br>Gabriela Nacif<br>Juliana Nakashima<br>Sophia Rezende' }
    ],
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
  exibirProjetoAtual();
}

function exibirProjetoAtual() {
  renderizarExpandido();
  mostrarPagina('projeto-expandido');
  window.scrollTo(0, 0);
}

// vídeos das galerias: baixam quando chegam perto da tela e pausam quando saem dela.
// Enquanto as fotos acima ainda carregam, a página fica "curta" e tudo parece perto do topo,
// então o vídeo só baixa depois que as fotos antes dele já têm tamanho.
function fotoAcimaPendente(v) {
  return [...document.querySelectorAll('#exp-imagens img')].some(img =>
    !img.complete && (img.compareDocumentPosition(v) & Node.DOCUMENT_POSITION_FOLLOWING));
}

function reavaliarVideos() {
  document.querySelectorAll('#exp-imagens video[data-src]').forEach(v => {
    observadorVideos.unobserve(v);
    observadorVideos.observe(v);
  });
}

const observadorVideos = new IntersectionObserver(entradas => {
  entradas.forEach(({ target: v, isIntersecting }) => {
    if (isIntersecting) {
      if (v.dataset.src) {
        if (fotoAcimaPendente(v)) return;
        v.src = v.dataset.src; v.removeAttribute('data-src');
      }
      v.play().catch(() => {});
    } else if (!v.paused) {
      v.pause();
    }
  });
}, { rootMargin: '400px 0px' });

function renderizarExpandido() {
  const p = projetos[projetoAtualIndex];
  const en = idioma === 'en';

  document.getElementById('exp-titulo').textContent = p.titulo;
  document.getElementById('exp-subtitulo').textContent = en ? p.subtitulo_en : p.subtitulo;
  document.getElementById('exp-tags').innerHTML = (en ? p.areas_en : p.areas)
    .split(',')
    .map(t => `<li>${t.trim().charAt(0).toUpperCase() + t.trim().slice(1)}</li>`)
    .join('');
  document.getElementById('exp-desc').innerHTML = en ? p.descricao_en : p.descricao;
  // itens alternam entre coluna da esquerda e da direita, cada uma com espaçamento próprio
  const grupo = m => `<div><dt>${en ? m.en : m.pt}</dt><dd>${en && m.valor_en ? m.valor_en : m.valor}</dd></div>`;
  const meta = p.meta || [];
  document.getElementById('exp-meta').innerHTML = [0, 1]
    .map(col => `<dl>${meta.filter((_, i) => i % 2 === col).map(grupo).join('')}</dl>`)
    .join('');

  // imagens: string = largura total, array = par lado a lado,
  // { src, menor: true } = menor e alinhada à esquerda; .mp4 vira vídeo em loop;
  // { src, largura: 30 } = 30% da largura, também alinhada à esquerda;
  // { par: [a, b], largura } = lado a lado com a mesma altura, mesmo com formatos diferentes;
  // { revista: pasta, paginas } = leitor folheável
  destruirRevista();
  const container = document.getElementById('exp-imagens');
  container.innerHTML = '';
  p.imagens.forEach(item => {
    if (item.revista) {
      container.appendChild(criarRevista(item));
      return;
    }
    const linha = document.createElement('div');
    linha.className = Array.isArray(item) ? 'exp-linha exp-par' : 'exp-linha';
    if (item.par) linha.classList.add('exp-par-alinhado');
    if (item.menor || item.largura) {
      linha.classList.add('exp-menor');
      if (item.largura) {
        linha.classList.add('exp-largura');
        linha.style.setProperty('--largura', item.largura + '%');
      }
    }
    if (item.par || item.src) item = item.par || item.src;
    [].concat(item).forEach(src => {
      if (src.endsWith('.mp4')) {
        const video = document.createElement('video');
        video.dataset.src = src;  // só baixa quando chega perto da tela (observadorVideos)
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.preload = 'metadata';
        observadorVideos.observe(video);
        // controles (pausar, barra de tempo) só aparecem com o mouse em cima; no celular, ao tocar
        video.addEventListener('mouseenter', () => { video.controls = true; });
        video.addEventListener('mouseleave', () => { video.controls = false; });
        video.addEventListener('touchstart', () => { video.controls = true; }, { passive: true });
        // na dupla alinhada, cada item cresce na proporção do seu formato → alturas iguais
        video.addEventListener('loadedmetadata', () => {
          video.style.flexGrow = video.videoWidth / video.videoHeight;
        });
        linha.appendChild(video);
        return;
      }
      const img = document.createElement('img');
      img.src = src;
      img.alt = p.titulo;
      img.loading = 'lazy';
      img.addEventListener('click', () => abrirLightbox(src));
      img.addEventListener('load', () => {
        img.style.flexGrow = img.naturalWidth / img.naturalHeight;
        reavaliarVideos();
      });
      linha.appendChild(img);
    });
    container.appendChild(linha);
  });

  const total = projetos.length;
  document.getElementById('exp-anterior').textContent = projetos[(projetoAtualIndex - 1 + total) % total].titulo;
  document.getElementById('exp-proximo').textContent = projetos[(projetoAtualIndex + 1) % total].titulo;

  // a seção só fica visível depois do mostrarPagina, então o leitor mede o espaço no próximo frame
  requestAnimationFrame(iniciarRevista);
}

function alternarAbout() {
  const secao = document.getElementById('projeto-expandido');
  const aberto = secao.classList.toggle('about-aberto');
  secao.querySelector('.exp-about-icone').textContent = aberto ? '×' : '+';
}

// avisa o leitor da revista quando a coluna de imagens muda de largura
document.getElementById('exp-corpo').addEventListener('transitionend', e => {
  if (e.target.id === 'exp-corpo' && revistaFlip) window.dispatchEvent(new Event('resize'));
});

/* ── LEITOR DA REVISTA (StPageFlip) ── */
let revistaFlip = null;
let revistaConfig = null;
let revistaImgs = [];

const ICONE_TELA_CHEIA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5M4 4l6 6M20 4l-6 6M4 20l6-6M20 20l-6-6"/></svg>';
const ICONE_FECHAR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';

function irParaPaginaRevista(valor) {
  if (!revistaFlip) return;
  revistaFlip.turnToPage(Number(valor));
  atualizarRevista();
}

function criarRevista(item) {
  revistaConfig = item;
  const en = idioma === 'en';
  const el = document.createElement('div');
  el.className = 'exp-revista';
  el.id = 'exp-revista';
  el.innerHTML = `
    <div class="revista-palco">
      <div class="revista-livro" id="revista-livro">
        ${Array.from({ length: item.paginas }, (_, i) =>
          `<div class="revista-pagina"><img data-src="${item.revista}/pagina-${String(i + 1).padStart(3, '0')}.jpg" alt="${en ? 'Page' : 'Página'} ${i + 1}" draggable="false"></div>`
        ).join('')}
      </div>
    </div>
    <div class="revista-controles">
      <button class="revista-btn" onclick="revistaFlip && revistaFlip.flipPrev()" aria-label="${en ? 'Previous page' : 'Página anterior'}">←</button>
      <span class="revista-contador" id="revista-contador"></span>
      <input type="range" class="revista-progresso" id="revista-progresso" min="0" max="${item.paginas - 1}" value="0"
        oninput="irParaPaginaRevista(this.value)" aria-label="${en ? 'Go to page' : 'Ir para a página'}">
      <button class="revista-btn" onclick="revistaFlip && revistaFlip.flipNext()" aria-label="${en ? 'Next page' : 'Próxima página'}">→</button>
      <button class="revista-btn revista-tela-cheia" onclick="alternarTelaCheiaRevista()" aria-label="${en ? 'Fullscreen' : 'Tela cheia'}">${ICONE_TELA_CHEIA}</button>
    </div>
    <p class="revista-dica">${en ? 'Click or drag the corners to flip through' : 'Clique ou arraste os cantos para folhear'}</p>`;
  return el;
}

function iniciarRevista() {
  const livro = document.getElementById('revista-livro');
  if (!livro || revistaFlip || typeof St === 'undefined') return;
  const [w, h] = revistaConfig.tamanho;
  // guarda a ordem original: o leitor reorganiza as páginas no DOM
  revistaImgs = [...livro.querySelectorAll('img')];

  revistaFlip = new St.PageFlip(livro, {
    width: w,
    height: h,
    size: 'stretch',
    // abaixo de 2x minWidth (≈ celular) mostra uma página por vez
    minWidth: 240,
    maxWidth: w * 2,
    minHeight: 240 * h / w,
    maxHeight: h * 2,
    showCover: true,
    usePortrait: true,
    mobileScrollSupport: true,
    maxShadowOpacity: 0.4,
    flippingTime: 800
  });
  revistaFlip.loadFromHTML(livro.querySelectorAll('.revista-pagina'));
  revistaFlip.on('flip', atualizarRevista);
  revistaFlip.on('changeOrientation', atualizarRevista);
  atualizarRevista();
}

function destruirRevista() {
  document.body.style.overflow = '';
  if (revistaFlip) {
    revistaFlip.destroy();
    revistaFlip = null;
  }
}

// carrega só as páginas perto da atual e atualiza o contador
function atualizarRevista() {
  if (!revistaFlip) return;
  const i = revistaFlip.getCurrentPageIndex();
  const total = revistaFlip.getPageCount();
  const en = idioma === 'en';

  revistaImgs.forEach((img, n) => {
    if (img.dataset.src && n >= i - 4 && n <= i + 8) {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    }
  });

  let texto;
  if (i === 0) texto = en ? 'Cover' : 'Capa';
  else if (i === total - 1) texto = en ? 'Back cover' : 'Contracapa';
  else if (revistaFlip.getOrientation() === 'landscape') texto = `${i + 1}–${i + 2}`;
  else texto = `${i + 1}`;
  document.getElementById('revista-contador').textContent = `${texto} / ${total}`;
  document.getElementById('revista-progresso').value = i;
}

// "tela cheia" feita com CSS (cobre a janela toda), funciona em qualquer navegador
function alternarTelaCheiaRevista(forcarFechar) {
  const el = document.getElementById('exp-revista');
  if (!el) return;
  const cheia = forcarFechar ? false : !el.classList.contains('revista-cheia');
  el.classList.toggle('revista-cheia', cheia);
  document.body.style.overflow = cheia ? 'hidden' : '';
  const en = idioma === 'en';
  const btn = el.querySelector('.revista-tela-cheia');
  btn.innerHTML = cheia ? ICONE_FECHAR : ICONE_TELA_CHEIA;
  btn.setAttribute('aria-label', cheia ? (en ? 'Close' : 'Fechar') : (en ? 'Fullscreen' : 'Tela cheia'));
  window.dispatchEvent(new Event('resize'));
}

document.addEventListener('keydown', e => {
  if (!revistaFlip || document.getElementById('lightbox').classList.contains('ativo')) return;
  if (!document.getElementById('projeto-expandido').classList.contains('ativa')) return;
  if (e.key === 'Escape') alternarTelaCheiaRevista(true);
  if (e.key === 'ArrowRight') revistaFlip.flipNext();
  if (e.key === 'ArrowLeft') revistaFlip.flipPrev();
});

function abrirLightbox(src) {
  document.getElementById('lightbox-img').src = src;
  document.getElementById('lightbox').classList.add('ativo');
}

function fecharLightbox() {
  document.getElementById('lightbox').classList.remove('ativo');
}

/* ── CURRÍCULO ──
   estados: 'escondido' (fora da tela), 'ponta' (só a pontinha embaixo), 'aberto' (no centro).
   A palavra "Currículo" mostra/esconde a ponta. Na ponta: passar o mouse levanta um pouco;
   arrastar para cima (ou clicar) traz para o centro, onde os links ficam clicáveis. */
const PONTA = 56, PONTA_HOVER = 150;
let cvEstado = 'escondido';

function cvPosicao(estado, hover) {
  const cv = document.getElementById('curriculo');
  if (estado === 'aberto') return (innerHeight - cv.offsetHeight) / 2;
  if (estado === 'ponta') return innerHeight - (hover ? PONTA_HOVER : PONTA);
  return innerHeight + 40;
}

// troca data-src por src (arquivos que só devem baixar quando forem usados)
function carregarAdiados(raiz) {
  raiz.querySelectorAll('[data-src]').forEach(el => {
    el.src = el.dataset.src;
    el.removeAttribute('data-src');
  });
}

function cvIr(estado) {
  const cv = document.getElementById('curriculo');
  if (estado !== 'escondido') carregarAdiados(cv);
  cvEstado = estado;
  cv.classList.toggle('aberto', estado === 'aberto');
  cv.style.setProperty('--y', cvPosicao(estado) + 'px');
}

// palavra "Currículo": escondido → ponta → escondido; se estiver aberto, volta para a ponta
function abrirCurriculo() { cvIr(cvEstado === 'escondido' ? 'ponta' : cvEstado === 'ponta' ? 'escondido' : 'ponta'); }

function fecharCurriculo() {
  if (cvEstado === 'aberto') cvIr('ponta');
}

(function () {
  const cv = document.getElementById('curriculo');
  let inicioY = 0, inicioPos = 0, arrastou = false, segurando = false;

  cv.addEventListener('mouseenter', () => { if (cvEstado === 'ponta' && !segurando) cv.style.setProperty('--y', cvPosicao('ponta', true) + 'px'); });
  cv.addEventListener('mouseleave', () => { if (cvEstado === 'ponta' && !segurando) cv.style.setProperty('--y', cvPosicao('ponta') + 'px'); });

  cv.addEventListener('pointerdown', e => {
    if (cvEstado === 'escondido') return;
    if (cvEstado === 'aberto' && e.target.closest('.cv-link')) return;  // deixa o link funcionar
    segurando = true; arrastou = false;
    inicioY = e.clientY;
    inicioPos = parseFloat(getComputedStyle(cv).getPropertyValue('--y')) || cvPosicao(cvEstado);
    cv.setPointerCapture(e.pointerId);
    cv.classList.add('arrastando');
  });

  cv.addEventListener('pointermove', e => {
    if (!segurando) return;
    const dy = e.clientY - inicioY;
    if (Math.abs(dy) > 4) arrastou = true;
    const topo = cvPosicao('aberto'), base = cvPosicao('ponta');
    cv.style.setProperty('--y', Math.min(base, Math.max(topo, inicioPos + dy)) + 'px');
  });

  cv.addEventListener('pointerup', e => {
    if (!segurando) return;
    segurando = false;
    cv.classList.remove('arrastando');
    const dy = e.clientY - inicioY;
    if (cvEstado === 'ponta') cvIr(!arrastou || dy < -60 ? 'aberto' : 'ponta');   // clique ou puxou para cima
    else cvIr(arrastou && dy > 80 ? 'ponta' : 'aberto');                          // puxou para baixo = guarda
  });

  // clique fora da folha aberta guarda de volta
  document.addEventListener('pointerdown', e => {
    if (cvEstado === 'aberto' && !cv.contains(e.target) && !e.target.closest('.cv-btn')) fecharCurriculo();
  });

  addEventListener('resize', () => cv.style.setProperty('--y', cvPosicao(cvEstado) + 'px'));
  cv.querySelector('img').addEventListener('load', () => cv.style.setProperty('--y', cvPosicao(cvEstado) + 'px'));
})();

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { fecharLightbox(); fecharCurriculo(); }
});

function navegarProjeto(direcao) {
  projetoAtualIndex = (projetoAtualIndex + direcao + projetos.length) % projetos.length;
  exibirProjetoAtual();
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
  btn.textContent = idioma === 'pt' ? 'ENG' : 'PT-BR';

  document.querySelectorAll('[data-pt][data-en]').forEach(el => {
    const texto = idioma === 'pt' ? el.dataset.pt : el.dataset.en;
    el.innerHTML = texto;
  });

  if (document.getElementById('projeto-expandido').classList.contains('ativa')) {
    renderizarExpandido();
  }
}

document.body.classList.add('home-ativa');
iniciarFisica();