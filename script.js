// --- CONSTANTES E VARIÁVEIS GLOBAIS ---

// ** 1. CREDENCIAIS SUPABASE **
const SUPABASE_URL = 'https://kngdhvmwmbcnrcutuuqm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuZ2Rodm13bWJjbnJjdXR1dXFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc1NTAzODksImV4cCI6MjA1MzEyNjM4OX0.iSycpy-YlpkiBpw4PC-0n4AIN0gxGs6OparYc5C0d20';
const SUPABASE_TABLE = 'album';

// ** 2. INICIALIZAÇÃO SUPABASE **
const {createClient} = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- Variáveis TMDb ---
const TMDB_API_KEY = '2b0120b7e901bbe70b631b2273fe28c9';
const BASE_IMAGE_URL = 'https://image.tmdb.org/t/p/w500';
const BASE_THUMB_URL = 'https://image.tmdb.org/t/p/w92';

const FILMES_POR_PAGINA = 100;

let filmes = [];
let editandoId = null;
let paginaAtual = 1;
let totalRegistros = 0;
let isLoggedIn = false;

// --- REFERÊNCIAS DE ELEMENTOS DOM ---
const modal = document.getElementById('modal-filme');
const modalTitulo = document.getElementById('modal-titulo');
const btnNovoFilme = document.getElementById('btn-novo-filme');
const btnFecharModal = document.getElementById('btn-fechar-modal');
const btnCancelar = document.getElementById('btn-cancelar');
const formFilme = document.getElementById('form-filme');
const gradeFilmes = document.getElementById('grade-filmes');
const msgSemFilmes = document.getElementById('msg-sem-filmes');

const inputID = document.getElementById('filme-id');
const inputTMDBBusca = document.getElementById('tmdb-id-busca');
const btnBuscarTMDBID = document.getElementById('btn-buscar-tmdb-id');
const inputTituloTraduzido = document.getElementById('titulo-traduzido');
const inputAno = document.getElementById('ano');
const inputCodigoTMDB = document.getElementById('codigo-tmdb');
const inputCodigoIMDB = document.getElementById('codigo-imdb');
const inputDataRelease = document.getElementById('data-release');
const radioPB = document.getElementById('radio-pb');
const radioCores = document.getElementById('radio-cores');
const inputPagina = document.getElementById('pagina');
const inputPasta = document.getElementById('pasta');
const inputLinkImagem = document.getElementById('link-imagem');
const inputTituloOriginal = document.getElementById('titulo-original');
const inputSinopse = document.getElementById('sinopse');
const posterPreview = document.getElementById('poster-preview');
const modalContentContainer = document.getElementById('modal-content-container');
const cartazesAlternativosContainer = document.getElementById('cartazes-alternativos-container');
const cartazesLista = document.getElementById('cartazes-lista');
const msgSemCartazes = document.getElementById('msg-sem-cartazes');
const sortCriterio = document.getElementById('sort-criterio');
const sortOrdem = document.getElementById('sort-ordem');
const inputBuscaTitulo = document.getElementById('busca-titulo');
const btnBuscarTitulo = document.getElementById('btn-buscar-titulo');
const resultadosBuscaTitulo = document.getElementById('resultados-busca-titulo');
const buscaIDMsg = document.getElementById('busca-id-msg');
const contadorRegistros = document.getElementById('contador-registros');
const inputFiltroTitulo = document.getElementById('filtro-titulo');
const inputFiltroAno = document.getElementById('filtro-ano');
const selectFiltroCores = document.getElementById('filtro-cores');
const radioBuscaTMDBId = document.getElementById('radio-busca-tmdb-id');
const radioBuscaTitulo = document.getElementById('radio-busca-titulo');
const buscaIdContainer = document.getElementById('busca-id-container');
const buscaTituloContainer = document.getElementById('busca-titulo-container');
const loadingSpinner = document.getElementById('loading-spinner');
const btnAnterior = document.getElementById('btn-anterior');
const btnProximo = document.getElementById('btn-proximo');
const infoPaginacao = document.getElementById('info-paginacao');
const btnPrimeira = document.getElementById('btn-primeira');
const btnUltima = document.getElementById('btn-ultima');
const linkTMDBModal = document.getElementById('link-tmdb-modal');
const linkIMDBModal = document.getElementById('link-imdb-modal');
const btnModalGrafico = document.getElementById('btn-modal-grafico');
const modalGrafico = document.getElementById('modal-grafico');
const btnFecharGrafico = document.getElementById('btn-fechar-grafico');
const graficoTotalRegistros = document.getElementById('grafico-total-registros');
const btnLogin = document.getElementById('btn-login');
const modalLogin = document.getElementById('modal-login');
const btnFecharLogin = document.getElementById('btn-fechar-login');
const formLogin = document.getElementById('form-login');
const inputLoginNome = document.getElementById('input-login-nome');
const inputLoginSenha = document.getElementById('input-login-senha');
const mensagemLogin = document.getElementById('mensagem-login');
const btnToggleBusca = document.getElementById('btn-toggle-busca');
const conteudoBuscaColapsavel = document.getElementById('conteudo-busca-colapsavel');
const iconeToggleBusca = document.getElementById('icone-toggle-busca');
const btnToggleCartazes = document.getElementById('btn-toggle-cartazes');
const conteudoCartazesColapsavel = document.getElementById('conteudo-cartazes-colapsavel');
const iconeToggleCartazes = document.getElementById('icone-toggle-cartazes');
const btnToggleBuscaTmdb = document.getElementById('btn-toggle-busca-tmdb');
const conteudoBuscaTmdbColapsavel = document.getElementById('conteudo-busca-tmdb-colapsavel');
const iconeToggleBuscaTmdb = document.getElementById('icone-toggle-busca-tmdb');
const buscaTmdbWrapper = document.getElementById('busca-tmdb-wrapper');

const debouncedCarregarFilmes = debounce(carregarFilmes, 500);

const debouncedBuscarFilmePorId = debounce(buscarFilmePorId, 800);   // 800ms para ID
const debouncedBuscarFilmePorTitulo = debounce(buscarFilmePorTitulo, 800); // 800ms para Título

// --- FUNÇÕES DE PERSISTÊNCIA (SUPABASE) ---
async function carregarFilmes(resetPagina = false) {
    loadingSpinner.classList.remove('hidden');
    loadingSpinner.classList.add('flex');

    const criterio = sortCriterio.value;
    const isAscending = sortOrdem.value === 'crescente';

    if (resetPagina) {
        paginaAtual = 1;
    }

    const inicio = (paginaAtual - 1) * FILMES_POR_PAGINA;
    const fim = inicio + FILMES_POR_PAGINA - 1;
    const filtroCor = selectFiltroCores.value;

    let query = supabaseClient.from(SUPABASE_TABLE).select('*', {count: 'exact'});
    if (filtroCor && filtroCor.length > 0) {
        query = query.eq('cores', filtroCor);

    }

    const termoBuscaAno = parseInt(inputFiltroAno.value.trim());
    if (!isNaN(termoBuscaAno)) {
        query = query.eq('ano', termoBuscaAno);
    }

    let termoBuscaTitulo = inputFiltroTitulo.value.trim().toLowerCase();
    termoBuscaTitulo = termoBuscaTitulo.replace(/[,"]/g, '');
    if (termoBuscaTitulo.length > 0) {
        const orFilter = `titulo_traduzido.ilike.%${termoBuscaTitulo}%,titulo_original.ilike.%${termoBuscaTitulo}%`;
        query = query.or(orFilter);
    }

    try {
        const {data, count, error} = await query
            .range(inicio, fim)
            .order(criterio, {ascending: isAscending});

        if (error) {
            console.error('Erro no carregamento:', error);
            alert(`Erro ao carregar dados: ${error.message}`);
            // Se houver erro, garantimos que filmes seja vazio para não renderizar lixo
            totalRegistros = 0;
            filmes = [];
            renderizarFilmes(); // Renderiza para mostrar tela vazia/mensagem de erro
            return; // Sai da função carregarFilmes se houver erro
        }

        totalRegistros = count || 0;
        filmes = data || [];

        renderizarFilmes();

    } catch (e) {
        console.error('Erro no carregamento:', e);
        alert(`Erro ao carregar dados: ${e.message}`);
    } finally {
        loadingSpinner.classList.add('hidden');
        loadingSpinner.classList.remove('flex');
    }
}

function navegarPaginaAnterior() {
    if (paginaAtual > 1) {
        paginaAtual--;
        carregarFilmes(false);
        window.scrollTo(0, 0);
    }
}

function navegarPaginaProxima() {
    const totalPaginas = Math.ceil(totalRegistros / FILMES_POR_PAGINA);
    if (paginaAtual < totalPaginas) {
        paginaAtual++;
        carregarFilmes(false);
        window.scrollTo(0, 0);
    }
}

function navegarPrimeiraPagina() {
    if (paginaAtual !== 1) {
        paginaAtual = 1;
        carregarFilmes(false);
        window.scrollTo(0, 0);
    }
}

function navegarUltimaPagina() {
    const totalPaginas = Math.ceil(totalRegistros / FILMES_POR_PAGINA);
    if (paginaAtual !== totalPaginas) {
        paginaAtual = totalPaginas;
        carregarFilmes(false); // Mantém o filtro, mas muda a página
        window.scrollTo(0, 0);
    }
}

function atualizarLinkTMDB() {
    const tmdbId = inputCodigoTMDB.value.trim();

    if (tmdbId) {
        linkTMDBModal.href = `https://www.themoviedb.org/movie/${tmdbId}`;
        linkTMDBModal.classList.remove('opacity-50', 'pointer-events-none');
    } else {
        linkTMDBModal.href = '#';
        linkTMDBModal.classList.add('opacity-50', 'pointer-events-none');
    }
}

function atualizarLinkIMDB() {
    const imdbId = inputCodigoIMDB.value.trim();
    if (imdbId) {
        linkIMDBModal.href = `https://www.imdb.com/title/${imdbId}`;
        linkIMDBModal.classList.remove('opacity-50', 'pointer-events-none');
    } else {
        linkIMDBModal.href = '#';
        linkIMDBModal.classList.add('opacity-50', 'pointer-events-none');
    }
}

// --- FUNÇÕES DO MODAL/FORMULÁRIO ---
function alternarBusca(modo) {
    if (modo === 'id') {
        buscaIdContainer.classList.remove('hidden');
        buscaTituloContainer.classList.add('hidden');
    } else if (modo === 'titulo') {
        buscaIdContainer.classList.add('hidden');
        buscaTituloContainer.classList.remove('hidden');
    }
}

function preencherFormulario(filme) {
    editandoId = filme.id;
    inputTMDBBusca.value = '';
    modalTitulo.textContent = `Editar Filme (ID: ${filme.id})`;

    // Mapeamento das colunas da tabela 'album' para os campos do formulário
    inputID.value = filme.id;
    inputTituloTraduzido.value = filme.titulo_traduzido || '';
    inputAno.value = filme.ano;
    inputCodigoTMDB.value = filme.tmdb;
    inputCodigoIMDB.value = filme.imdb || '';

    // Tipo de Cor (coluna 'cores')
    if (filme.cores === 'Preto Branco') {
        radioPB.checked = true;
        radioCores.checked = false;
    } else {
        radioCores.checked = true;
        radioPB.checked = false;
    }

    inputPagina.value = filme.pagina || '';
    inputPasta.value = filme.pasta || '';
    inputLinkImagem.value = filme.link_imagem || '';
    inputDataRelease.value = filme.data_release || '';
    inputTituloOriginal.value = filme.titulo_original || '';
    inputSinopse.value = filme.sinopse || '';
    posterPreview.src = filme.link_imagem || 'data:image:gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

    inputTMDBBusca.value = filme.tmdb;
    resultadosBuscaTitulo.innerHTML = '';
    buscaIDMsg.classList.add('hidden');

    modal.classList.remove('hidden');
    modal.classList.add('flex');

    // Estado do Acordeão de Cartazes (Sempre Colapsado na Edição)
    conteudoCartazesColapsavel.classList.remove('max-h-screen');
    conteudoCartazesColapsavel.classList.add('max-h-0');
    iconeToggleCartazes.classList.remove('fa-chevron-up');
    iconeToggleCartazes.classList.add('fa-chevron-down');

    // ** Lógica da busca TMDb: COLAPSADO na Edição **
    alternarBuscaTmdbAcordeon(false);

    if (modalContentContainer) {
        modalContentContainer.scrollTop = 0;
    }

    buscarCartazes(filme.tmdb);

    atualizarLinkTMDB();
    atualizarLinkIMDB();
}

function abrirModalEdicao(id) {
    const filme = filmes.find(f => f.id === id);
    if (!filme) return;

    colapsarBuscaTmdb();

    preencherFormulario(filme);
}

function abrirModalNovo() {
    editandoId = null;
    modalTitulo.textContent = 'Adicionar Novo Filme';
    formFilme.reset();
    inputTMDBBusca.value = '';
    radioCores.checked = true;
    posterPreview.src = 'data:image:gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
    resultadosBuscaTitulo.innerHTML = '';
    buscaIDMsg.classList.add('hidden');
    cartazesAlternativosContainer.classList.add('hidden');
    modal.classList.remove('hidden');

    // Estado do Acordeão de Cartazes (Sempre Colapsado ao Abrir Novo)
    conteudoCartazesColapsavel.classList.remove('max-h-screen');
    conteudoCartazesColapsavel.classList.add('max-h-0');
    iconeToggleCartazes.classList.remove('fa-chevron-up');
    iconeToggleCartazes.classList.add('fa-chevron-down');

    // ** Lógica da busca TMDb: ABERTO no Novo **
    expandirBuscaTmdb();
    alternarBusca('titulo');

    if (modalContentContainer) {
        modalContentContainer.scrollTop = 0;
    }

    modal.classList.add('flex');
    atualizarLinkTMDB();
    atualizarLinkIMDB();

    inputBuscaTitulo.focus();
}

function alternarCartazesAcordeon() {
    const isCollapsed = conteudoCartazesColapsavel.classList.contains('max-h-0');

    if (isCollapsed) {
        // Expande
        conteudoCartazesColapsavel.classList.remove('max-h-0');
        conteudoCartazesColapsavel.classList.add('max-h-screen');
        iconeToggleCartazes.classList.remove('fa-chevron-down');
        iconeToggleCartazes.classList.add('fa-chevron-up');
    } else {
        // Colapsa
        conteudoCartazesColapsavel.classList.remove('max-h-screen');
        conteudoCartazesColapsavel.classList.add('max-h-0');
        iconeToggleCartazes.classList.remove('fa-chevron-up');
        iconeToggleCartazes.classList.add('fa-chevron-down');
    }
}

// script.js - MANTENHA ESTAS DUAS FUNÇÕES
function expandirBuscaTmdb() {
    conteudoBuscaTmdbColapsavel.classList.remove('max-h-0');
    conteudoBuscaTmdbColapsavel.classList.add('max-h-[700px]');
    // Remove classes de separação visual quando está aberto
    buscaTmdbWrapper.classList.remove('pt-3', 'mt-3', 'border-t', 'border-suave');
    iconeToggleBuscaTmdb.classList.remove('fa-chevron-down');
    iconeToggleBuscaTmdb.classList.add('fa-chevron-up');
}

function colapsarBuscaTmdb() {
    conteudoBuscaTmdbColapsavel.classList.remove('max-h-[700px]');
    conteudoBuscaTmdbColapsavel.classList.add('max-h-0');
    // Adiciona classes de separação visual quando fechado
    buscaTmdbWrapper.classList.add('pt-3', 'mt-3', 'border-t', 'border-suave');
    iconeToggleBuscaTmdb.classList.remove('fa-chevron-up');
    iconeToggleBuscaTmdb.classList.add('fa-chevron-down');
}

function fecharModal() {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

formFilme.addEventListener('submit', async function (e) {
    e.preventDefault();

    const tipoCorSelecionado = document.querySelector('input[name="tipoCor"]:checked');

    // Mapeamento dos campos do formulário para as COLUNAS da tabela 'album'
    const dadosFilme = {
        tmdb: getIntOrNull(inputCodigoTMDB.value),
        imdb: inputCodigoIMDB.value.trim() || null,
        titulo_original: inputTituloOriginal.value.trim().toUpperCase() || null,
        titulo_traduzido: inputTituloTraduzido.value.trim().toUpperCase() || null,
        pagina: inputPagina.value.trim() || 0,
        pasta: inputPasta.value.trim() || 0,
        data_release: inputDataRelease.value.trim() || null,
        ano: getIntOrNull(inputAno.value),
        link_imagem: inputLinkImagem.value.trim() || null,
        sinopse: inputSinopse.value.trim() || null,
        cores: tipoCorSelecionado ? tipoCorSelecionado.value : 'Cores',
    };

    let error;
    if (editandoId) {
        // MODO EDIÇÃO
        const response = await supabaseClient
            .from(SUPABASE_TABLE)
            .update(dadosFilme)
            .eq('id', editandoId);
        error = response.error;
    } else {
        // MODO NOVO
        const response = await supabaseClient
            .from(SUPABASE_TABLE)
            .insert([dadosFilme]);
        error = response.error;
    }

    if (error) {
        console.error('Erro ao salvar no Supabase:', error);
        alert(`Erro ao salvar: ${error.message}. Verifique o RLS.`);
    } else {
        await carregarFilmes(true);
        fecharModal();
    }
});

function alternarBuscaPrincipal() {
    const isCollapsed = conteudoBuscaColapsavel.classList.contains('max-h-0');

    if (isCollapsed) {
        // Expande
        conteudoBuscaColapsavel.classList.remove('max-h-0', 'border-t');
        conteudoBuscaColapsavel.classList.add('max-h-screen');
        iconeToggleBusca.classList.remove('fa-chevron-down');
        iconeToggleBusca.classList.add('fa-chevron-up');
    } else {
        // Colapsa
        conteudoBuscaColapsavel.classList.remove('max-h-screen');
        conteudoBuscaColapsavel.classList.add('max-h-0', 'border-t');
        iconeToggleBusca.classList.remove('fa-chevron-up');
        iconeToggleBusca.classList.add('fa-chevron-down');
    }
}

// --- FUNÇÕES DE RENDERIZAÇÃO E ORDENAÇÃO ---
function criarCardFilme(filme) {
    const card = document.createElement('div');
    card.className = 'group bg-white rounded-lg shadow-lg hover:shadow-xl transition duration-300 overflow-hidden border border-suave';
    card.setAttribute('data-id', filme.id);

    const imageUrl = filme.link_imagem || '';
    const placeholderText = 'SEM CARTAZ';

    const botoesAcaoHtml = isLoggedIn ? `
    <div class="absolute inset-0 flex flex-col justify-end p-2 bg-black bg-opacity-40
                transition-opacity duration-300 opacity-0 group-hover:opacity-100">
        <div class="flex space-x-2">
            <button class="flex-1 py-2 px-1 bg-edit/90 hover:bg-edit text-white font-semibold rounded-lg transition duration-300 btn-editar" data-id="${filme.id}">
                <i class="fas fa-edit mr-1"></i> Editar
            </button>
            <button class="flex-1 py-2 px-1 bg-danger/90 hover:bg-danger text-white font-semibold rounded-lg transition duration-300 btn-excluir" data-id="${filme.id}">
                <i class="fas fa-trash-alt mr-1"></i> Excluir
            </button>
        </div>
    </div>
` : '';

    const infoLocalizacaoHtml = isLoggedIn ? `
        <p class="text-xs text-texto-suave truncate">
            ${filme.pagina ? `Pág: ${filme.pagina}` : ''}
            ${(filme.pagina && filme.pasta) ? ` | ` : ''}
            ${filme.pasta ? `Pasta: ${filme.pasta}` : ''}
        </p>
    ` : '';

    card.innerHTML = `
        <div class="poster-area">
            ${imageUrl ?
        `<img src="${imageUrl}"
                      alt="${filme.titulo_traduzido} Cartaz"
                      class="card-poster">`
        :
        `<div class="card-poster flex items-center justify-center text-xl font-bold text-texto-suave bg-[#f3f4f6] p-2">
                         ${placeholderText}
                     </div>`
    }

            ${botoesAcaoHtml}
        </div>

        <div class="p-3 text-center">
            <h3 class="text-sm font-bold text-gray-800 truncate input-uppercase" title="${filme.titulo_traduzido}">${filme.titulo_traduzido}</h3>

            ${filme.titulo_original ? `<p class="text-xs text-texto-suave truncate italic mt-[-2px] mb-1 input-uppercase" title="Título Original">${filme.titulo_original}</p>` : ''}

            <p class="text-xs text-texto-suave flex justify-center items-center space-x-2">
                ${filme.tmdb ? `
                    <a href="https://www.themoviedb.org/movie/${filme.tmdb}" target="_blank" class="text-principal hover:underline font-semibold flex items-center" title="Ver filme no TMDb">
                        <i class="fas fa-ticket-alt mr-1 text-gray-500"></i> TMDB
                    </a>
                ` : ''}

                ${filme.imdb ? `
                    <a href="https://www.imdb.com/title/${filme.imdb}" target="_blank" class="text-principal hover:underline font-semibold flex items-center" title="Ver filme no IMDb">
                        <i class="fab fa-imdb mr-1 text-yellow-500"></i> IMDB
                    </a>
                ` : ''}
            </p>
            
            ${infoLocalizacaoHtml}
            
            <p class="text-xs font-semibold mt-1 text-texto-suave">
                <span>${filme.ano}</span>
                <span class="ml-1">
                    | ${filme.cores || 'Cores'}
                </span>
            </p>
        </div>
    `;
    return card;
}

// RENDERIZAR FILMES
function renderizarFilmes() {

    loadingSpinner.classList.remove('hidden');
    loadingSpinner.classList.add('flex');

    // setTimeout garante que o spinner apareça antes da renderização
    setTimeout(() => {
        gradeFilmes.innerHTML = '';

        // ** 1. A FILTRAGEM JÁ FOI FEITA PELO SUPABASE. Apenas renderizamos 'filmes' **
        let listaFiltrada = [...filmes];

        // Se o Supabase não encontrou nada (ex: Filtro errado), listaFiltrada.length será 0
        const totalFilmesRenderizados = listaFiltrada.length;

        if (totalFilmesRenderizados === 0) {
            // Mensagem genérica, pois o Supabase já aplicou o filtro
            msgSemFilmes.textContent = `Nenhum filme encontrado na Página ${paginaAtual} para os filtros aplicados.`;
            msgSemFilmes.classList.remove('hidden');

        } else {
            msgSemFilmes.classList.add('hidden');

            // Renderiza a lista (máx. FILMES_POR_PAGINA)
            listaFiltrada.forEach(filme => {
                const card = criarCardFilme(filme);
                gradeFilmes.appendChild(card);
            });
        }

        // 2. ATUALIZA IU DE PAGINAÇÃO (Mantido)
        const totalPaginas = Math.ceil(totalRegistros / FILMES_POR_PAGINA);
        infoPaginacao.textContent = `Página ${paginaAtual} de ${totalPaginas} (${totalRegistros} total)`;

        btnAnterior.disabled = paginaAtual === 1;
        btnProximo.disabled = paginaAtual === totalPaginas || totalPaginas === 0;
        btnPrimeira.disabled = paginaAtual === 1 || totalPaginas === 0;
        btnUltima.disabled = paginaAtual === totalPaginas || totalPaginas === 0;

        // 3. ATUALIZA CONTADOR GERAL (Mantido)
        contadorRegistros.textContent = `${totalRegistros.toString().padStart(2, '0')} Registros`;

        loadingSpinner.classList.add('hidden');
        loadingSpinner.classList.remove('flex');

    }, 50);
}

gradeFilmes.addEventListener('click', function (e) {
    const target = e.target.closest('.btn-editar, .btn-excluir');
    if (!target) return;

    const id = parseInt(target.getAttribute('data-id'));

    if (target.classList.contains('btn-editar')) {
        abrirModalEdicao(id);
    } else if (target.classList.contains('btn-excluir')) {
        excluirFilme(id);
    }
});

async function excluirFilme(id) {
    const filme = filmes.find(f => f.id === id);
    const tituloParaExcluir = filme ? filme.titulo_traduzido : `ID ${id}`;

    if (confirm(`Tem certeza que deseja excluir o filme "${tituloParaExcluir}"?`)) {
        const {error} = await supabaseClient
            .from(SUPABASE_TABLE)
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Erro ao excluir:', error);
            alert(`Erro ao excluir: ${error.message}`);
        } else {
            await carregarFilmes(true);
        }
    }
}

// --- FUNÇÕES DE BUSCA (API TMDb) ---
// --- FUNÇÕES DE BUSCA (API TMDb) ---
async function buscarCartazes(tmdbId) {
    cartazesLista.innerHTML = '';
    msgSemCartazes.textContent = 'Carregando cartazes...';
    cartazesAlternativosContainer.classList.remove('hidden');

    const url = `https://api.themoviedb.org/3/movie/${tmdbId}/images?api_key=${TMDB_API_KEY}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Erro ao buscar imagens.');

        const data = await response.json();

        // ** NOVA LÓGICA DE ORDENAÇÃO: 1º en/sem idioma, 2º pt, 3º por votos **
        const cartazesOrdenados = data.posters
            .sort((a, b) => {
                const aIsEn = a.iso_639_1 === 'en' || !a.iso_639_1;
                const bIsEn = b.iso_639_1 === 'en' || !b.iso_639_1;

                // Prioridade 1: EN ou sem idioma (que geralmente é o EN)
                if (aIsEn && !bIsEn) return -1;
                if (!aIsEn && bIsEn) return 1;

                const aIsPt = a.iso_639_1 === 'pt';
                const bIsPt = b.iso_639_1 === 'pt';

                // Prioridade 2: PT
                if (aIsPt && !bIsPt) return -1;
                if (!aIsPt && bIsPt) return 1;

                return b.vote_count - a.vote_count; // Desempate por votos
            });

        // Filtra apenas os 50 melhores ou os primeiros 50
        const cartazesFinais = cartazesOrdenados.slice(0, 50);

        if (cartazesFinais.length > 0) {
            msgSemCartazes.classList.add('hidden');

            let defaultPosterSet = false;

            cartazesFinais.forEach(poster => {
                const fullPath = poster.file_path;
                const thumbUrl = `${BASE_THUMB_URL}${fullPath}`;
                const fullUrl = `${BASE_IMAGE_URL}${fullPath}`;

                // ** NOVIDADE: Define o primeiro cartaz EN/sem idioma como o padrão **
                if (!defaultPosterSet && (poster.iso_639_1 === 'en' || !poster.iso_639_1)) {
                    inputLinkImagem.value = fullUrl;
                    posterPreview.src = fullUrl;
                    defaultPosterSet = true; // Garante que só define uma vez
                }

                const img = document.createElement('img');
                img.src = thumbUrl;
                img.alt = `Cartaz Alternativo (${poster.iso_639_1 || 'N/A'})`;
                img.className = 'w-full h-36 object-cover rounded-md cursor-pointer border-2 border-transparent hover:border-principal transition duration-150';
                img.setAttribute('data-full-url', fullUrl);

                img.addEventListener('click', () => {
                    inputLinkImagem.value = fullUrl;
                    posterPreview.src = fullUrl;
                });

                cartazesLista.appendChild(img);
            });

            // Se nenhum cartaz EN/sem idioma foi encontrado (situação rara), o cartaz
            // principal vindo de buscarFilmePorId será mantido.

        } else {
            msgSemCartazes.textContent = 'Nenhum cartaz alternativo encontrado.';
            msgSemCartazes.classList.remove('hidden');
        }

    } catch (error) {
        console.error('Erro ao buscar cartazes alternativos:', error);
        msgSemCartazes.textContent = 'Erro ao carregar cartazes.';
        msgSemCartazes.classList.remove('hidden');
    }
}

async function buscarFilmePorId(tmdbId) {
    if (!tmdbId) return;

    buscaIDMsg.classList.add('hidden');
    btnBuscarTMDBID.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    btnBuscarTMDBID.disabled = true;

    const url = `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${TMDB_API_KEY}&language=pt-BR`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Filme não encontrado ou erro na API.');

        const data = await response.json();

        // Preenche os campos
        inputCodigoTMDB.value = data.id;
        inputCodigoIMDB.value = data.imdb_id || '';
        inputTituloOriginal.value = data.original_title;
        inputTituloTraduzido.value = data.title;
        inputAno.value = data.release_date ? data.release_date.substring(0, 4) : '';

        if (data.release_date) {
            inputAno.value = data.release_date.substring(0, 4); // Ano (YYYY)
            inputDataRelease.value = data.release_date; // Data completa (YYYY-MM-DD)
        } else {
            inputAno.value = '';
            inputDataRelease.value = '';
        }

        inputSinopse.value = data.overview;

        const posterPath = data.poster_path;
        const fullImageUrl = posterPath ? `${BASE_IMAGE_URL}${posterPath}` : '';
        inputLinkImagem.value = fullImageUrl;
        posterPreview.src = fullImageUrl || 'https://via.placeholder.com/500x750?text=Sem+Cartaz';

        buscarCartazes(tmdbId);

    } catch (error) {
        console.error('Erro na busca por ID TMDb:', error);
        buscaIDMsg.textContent = 'Erro na busca ou ID TMDb inválido.';
        buscaIDMsg.classList.remove('hidden');
    } finally {
        btnBuscarTMDBID.innerHTML = '<i class="fas fa-sync-alt"></i>';
        btnBuscarTMDBID.disabled = false;

        atualizarLinkTMDB();
        atualizarLinkIMDB();
    }
}

async function buscarFilmePorTitulo(titulo) {
    if (!titulo) return;

    btnBuscarTitulo.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    btnBuscarTitulo.disabled = true;
    resultadosBuscaTitulo.innerHTML = '';

    const url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&language=pt-BR&query=${encodeURIComponent(titulo)}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Erro na API de busca.');

        const data = await response.json();

        if (data.results && data.results.length > 0) {
            data.results.slice(0, 5).forEach(filme => {

                // ** NOVIDADE: Gera o HTML da imagem do cartaz **
                const posterPath = filme.poster_path;
                const posterHtml = posterPath
                    ? `<img src="${BASE_THUMB_URL}${posterPath}" class="w-8 h-12 object-cover rounded-sm mr-2 border border-suave" alt="Cartaz">`
                    : `<div class="w-8 h-12 flex items-center justify-center mr-2 bg-gray-200 text-xs text-texto-suave rounded-sm">?</div>`;

                const item = document.createElement('div');
                item.className = 'p-2 bg-white hover:bg-destaque-card cursor-pointer rounded-md border border-suave text-sm flex justify-between items-center';
                item.setAttribute('data-tmdb-id', filme.id);

                // ** NOVIDADE: Insere a imagem e o nome/ano lado a lado **
                item.innerHTML = `
                        <span class="flex items-center">
                            ${posterHtml}
                            <span>${filme.title} (${filme.release_date ? filme.release_date.substring(0, 4) : 'N/A'})</span>
                        </span>
                        <i class="fas fa-hand-pointer text-principal"></i>
                    `;

                item.addEventListener('click', () => {
                    buscarFilmePorId(filme.id);
                    resultadosBuscaTitulo.innerHTML = '';
                    inputBuscaTitulo.value = '';
                });
                resultadosBuscaTitulo.appendChild(item);
            });
        } else {
            resultadosBuscaTitulo.innerHTML = '<p class="text-texto-suave italic p-2">Nenhum resultado encontrado para o título.</p>';
        }

    } catch (error) {
        console.error('Erro na busca por Título TMDb:', error);
        resultadosBuscaTitulo.innerHTML = '<p class="text-danger italic p-2">Erro ao buscar no TMDb. Verifique sua chave de API.</p>';
    } finally {
        btnBuscarTitulo.innerHTML = '<i class="fas fa-search"></i>';
        btnBuscarTitulo.disabled = false;
    }
}

/***************************************************/
/************* FUNÇÕES DE AUTH E ADMIN UI **********/

/***************************************************/

function atualizarUIAdmin(logado) {
    isLoggedIn = logado;

    if (logado) {
        btnNovoFilme.classList.remove('hidden');
        btnLogin.innerHTML = '<i class="fas fa-sign-out-alt mr-2"></i> LOGOUT';
        btnLogin.classList.remove('bg-texto-suave');
        btnLogin.classList.add('bg-danger');
    } else {
        btnNovoFilme.classList.add('hidden');
        btnLogin.innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i> Login';
        btnLogin.classList.remove('bg-danger');
        btnLogin.classList.add('bg-texto-suave');
    }

    renderizarFilmes();
}

async function fazerLogin(e) {
    e.preventDefault();

    const email = inputLoginNome.value.trim();
    const password = inputLoginSenha.value.trim();
    mensagemLogin.classList.add('hidden');

    if (!email || !password) return;

    try {
        const {error} = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) throw error;

        // Login bem-sucedido
        atualizarUIAdmin(true);
        fecharModalLogin();

    } catch (error) {
        console.error('Erro ao fazer login:', error.message);
        mensagemLogin.textContent = 'Email ou senha inválidos. Tente novamente.';
        mensagemLogin.classList.remove('hidden');
    }
}

async function fazerLogout() {
    await supabaseClient.auth.signOut();
    atualizarUIAdmin(false);
    // exibirToast('Logout realizado com sucesso!', 'bg-principal'); // COMENTADO: exibirToast não existe no código
    carregarFilmes(true);
}

function abrirModalLogin() {
    modalLogin.classList.remove('hidden');
    modalLogin.classList.add('flex');
    inputLoginNome.focus();
}

function fecharModalLogin() {
    modalLogin.classList.add('hidden');
    modalLogin.classList.remove('flex');
    mensagemLogin.classList.add('hidden');
    formLogin.reset();
}

async function checkInitialSession() {
    const {data: {session}} = await supabaseClient.auth.getSession();
    if (session) {
        // Se houver sessão, atualiza a UI para logado
        atualizarUIAdmin(true);
    } else {
        // Se não houver sessão, garante que a UI esteja deslogada
        atualizarUIAdmin(false);
    }
}

/***************************************************/
/************* FUNCOES DE GRAFICO *****************/
/***************************************************/

let meuGrafico = null;

/** Processa o array de filmes para contar a frequência de cada ano. */
function processarDadosGrafico(filmesArray) {
    const contagemAnos = {};

    filmesArray.forEach(filme => {
        const ano = parseInt(filme.ano);

        // CRÍTICO: Checa se o ano é um NÚMERO, se é maior que 1800 (para excluir 0, NaN) E MENOR que 9999
        if (!isNaN(ano) && ano > 1800 && ano <= 9999) {
            contagemAnos[ano] = (contagemAnos[ano] || 0) + 1;
        }
    });

    // Ordena os anos como NÚMEROS
    const anosOrdenados = Object.keys(contagemAnos)
        .sort((a, b) => parseInt(a) - parseInt(b));

    const dados = anosOrdenados.map(ano => contagemAnos[ano]);

    return {
        labels: anosOrdenados,
        dados: dados,
    };
}

/** Desenha o gráfico de barras. */
function desenharGrafico(dadosProcessados) {

    const canvasElement = document.getElementById('grafico-filmes');
    if (!canvasElement) return;

    // 1. Destruir e Resetar
    if (meuGrafico) {
        meuGrafico.destroy();
        meuGrafico = null;
    }

    const ctx = canvasElement.getContext('2d');
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    const NUM_ANOS = dadosProcessados.labels.length;
    const ALTURA_POR_BARRA = 20; // 20px por barra (um valor seguro)
    const ALTURA_NECESSARIA = Math.max(400, NUM_ANOS * ALTURA_POR_BARRA); // Mínimo de 400px

    canvasElement.style.height = `${ALTURA_NECESSARIA}px`;

    meuGrafico = new Chart(canvasElement, {
        type: 'bar',
        data: {
            labels: dadosProcessados.labels,
            datasets: [{
                label: 'Número de Filmes',
                data: dadosProcessados.dados,
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: false, // Mantido para evitar loop
            maintainAspectRatio: false,
            indexAxis: 'y', // Gráfico Horizontal
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: { // Eixo X é a QUANTIDADE (horizontal)
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Quantidade de Filmes'
                    },
                    ticks: {
                        precision: 0,
                        stepSize: 100
                    }
                },
                y: { // Eixo Y é o ANO (vertical)
                    title: {
                        display: true,
                        text: 'Ano de Lançamento'
                    },
                    ticks: {
                        autoSkip: false // CRÍTICO: Exibe todos os anos
                    }
                }
            }
        }
    });
}

async function abrirModalGrafico() {
    loadingSpinner.classList.remove('hidden');
    loadingSpinner.classList.add('flex');

    // 1. EXECUTA UMA NOVA BUSCA COMPLETA APENAS PARA O GRÁFICO
    const {data, error} = await supabaseClient
        .from(SUPABASE_TABLE)
        .select('ano') // Busca APENAS a coluna 'ano'
        .range(0, 4999); // Limite alto para pegar todos os registros

    loadingSpinner.classList.add('hidden');
    loadingSpinner.classList.remove('flex');

    if (error) {
        console.error('Erro ao buscar dados para o gráfico:', error);
        alert('Erro ao carregar todos os dados para o gráfico.');
        return;
    }

    const todosOsAnos = data || [];

    // 2. PROCESSA OS DADOS COMPLETOS
    const dadosProcessados = processarDadosGrafico(todosOsAnos);

    // 3. Exibe o modal
    modalGrafico.classList.remove('hidden');
    modalGrafico.classList.add('flex');

    graficoTotalRegistros.textContent = totalRegistros;

    // 4. Desenha o gráfico (Com os dados COMPLETO e processados)
    setTimeout(() => {
        desenharGrafico(dadosProcessados);
    }, 100);
}

/** Fecha o modal do gráfico. */
function fecharModalGrafico() {
    modalGrafico.classList.add('hidden');
    modalGrafico.classList.remove('flex');
}

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

/***************************************************/
/************* LISTENERS DE EVENTOS *****************/
/***************************************************/

btnNovoFilme.addEventListener('click', abrirModalNovo);
btnCancelar.addEventListener('click', fecharModal);
btnFecharModal.addEventListener('click', fecharModal);

selectFiltroCores.addEventListener('change', () => carregarFilmes(true));
sortCriterio.addEventListener('change', () => carregarFilmes(true));
sortOrdem.addEventListener('change', () => carregarFilmes(true));

btnToggleBusca.addEventListener('click', alternarBuscaPrincipal);
btnToggleCartazes.addEventListener('click', alternarCartazesAcordeon);

inputLinkImagem.addEventListener('input', (e) => {
    posterPreview.src = e.target.value || 'data:image:gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
});

btnPrimeira.addEventListener('click', navegarPrimeiraPagina);
btnUltima.addEventListener('click', navegarUltimaPagina);
btnAnterior.addEventListener('click', navegarPaginaAnterior);
btnProximo.addEventListener('click', navegarPaginaProxima);

btnToggleBuscaTmdb.addEventListener('click', () => {
    const isCollapsed = conteudoBuscaTmdbColapsavel.classList.contains('max-h-0');
    if (isCollapsed) {
        expandirBuscaTmdb();
    } else {
        colapsarBuscaTmdb();
    }
});

inputTMDBBusca.addEventListener('input', (e) => {
    const tmdbId = parseInt(e.target.value.trim());
    if (!isNaN(tmdbId)) {
        debouncedBuscarFilmePorId(tmdbId);
    }
});

inputBuscaTitulo.addEventListener('input', (e) => {
    const titulo = e.target.value.trim();
    if (titulo.length > 2) { // Adiciona um limite mínimo para evitar buscas excessivas
        debouncedBuscarFilmePorTitulo(titulo);
    }
    // Opcional: Limpar resultados se o campo estiver vazio
    if (titulo.length === 0) {
        resultadosBuscaTitulo.innerHTML = '';
    }
});

// btnBuscarTMDBID.addEventListener('click', () => {
//     const tmdbId = parseInt(inputTMDBBusca.value.trim());
//     if (tmdbId) {
//         buscarFilmePorId(tmdbId);
//     }
// });
//
// btnBuscarTitulo.addEventListener('click', () => {
//     const titulo = inputBuscaTitulo.value.trim();
//     if (titulo) {
//         buscarFilmePorTitulo(titulo);
//     }
// });

inputCodigoTMDB.addEventListener('input', atualizarLinkTMDB);
inputCodigoIMDB.addEventListener('input', atualizarLinkIMDB);

document.addEventListener('keydown', function (e) {
    // Verifica se a tecla pressionada é 'Escape' (ou keyCode 27)
    if (e.key === 'Escape') {
        // Verifica se o modal está visível (se não tem a classe 'hidden')
        if (!modal.classList.contains('hidden')) {
            fecharModal(); // Chama a função que fecha o modal
        }
    }
});

inputFiltroTitulo.addEventListener('input', () => debouncedCarregarFilmes(true));
inputFiltroAno.addEventListener('input', () => debouncedCarregarFilmes(true));
selectFiltroCores.addEventListener('change', () => carregarFilmes(true));

/** Converte um valor de input para inteiro, retornando null se o campo estiver vazio ou for NaN. */
function getIntOrNull(inputValue) {
    const value = inputValue.trim();
    if (!value) return null; // Retorna null se estiver vazio
    const num = parseInt(value);
    return isNaN(num) ? null : num; // Retorna o número ou null se for inválido
}

radioBuscaTMDBId.addEventListener('change', () => alternarBusca('id'));
radioBuscaTitulo.addEventListener('change', () => alternarBusca('titulo'));

btnModalGrafico.addEventListener('click', abrirModalGrafico);
btnFecharGrafico.addEventListener('click', fecharModalGrafico);

// Opcional: Fechar gráfico com ESC
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        if (!modalGrafico.classList.contains('hidden')) {
            fecharModalGrafico();
        }
    }
});

btnLogin.addEventListener('click', () => {
    if (isLoggedIn) {
        fazerLogout();
    } else {
        abrirModalLogin();
    }
});

btnFecharLogin.addEventListener('click', fecharModalLogin);
formLogin.addEventListener('submit', fazerLogin);

window.onload = function () {
    checkInitialSession();
    carregarFilmes(true);
    alternarBusca('titulo');
};