import { CarteiraAusente } from "@/components/empresa/component/empresas_ausente";
import { CarteiraVendedor } from "@/components/empresa/component/empresas_vendedor";
import { FiltroEmpresa } from "@/components/empresa/component/fitro/empresa";
import {
  FiltroCNAE,
  FiltroCNAERef,
} from "@/components/empresa/component/fitro/cnae";
import {
  FiltroCidade,
  FiltroCidadeRef,
} from "@/components/empresa/component/fitro/cidade";
import {
  Box,
  Button,
  Flex,
  Heading,
  useToast,
  Select,
  FormLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  HStack,
  Input,
} from "@chakra-ui/react";
import { FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";
import axios from "axios";
import { parseISO, startOfDay } from "date-fns";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";

function Empresas() {
  const router = useRouter();
  const { data: session } = useSession();
  const toast = useToast();
  const isAdmin = session?.user?.pemission === "Adm";

  // Estados separados para cada tipo de empresa
  const [empresasComVendedor, setEmpresasComVendedor] = useState<any[]>([]);
  const [empresasSemVendedor, setEmpresasSemVendedor] = useState<any[]>([]);

  // Estados para filtro e paginação
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroCNAE, setFiltroCNAE] = useState("");
  const [filtroCidade, setFiltroCidade] = useState("");
  const [filtroVendedorId, setFiltroVendedorId] = useState<string>("");
  const [ordemClassificacao, setOrdemClassificacao] = useState<
    "relevancia" | "expiracao"
  >("relevancia");
  const filtroCNAERef = useRef<FiltroCNAERef>(null);
  const filtroCidadeRef = useRef<FiltroCidadeRef>(null);
  const [paginaAtualSemVendedor, setPaginaAtualSemVendedor] = useState(1);
  const [paginaAtualComVendedor, setPaginaAtualComVendedor] = useState(1);
  const [carregandoVendedor, setCarregandoVendedor] = useState(false);
  const [carregandoSemVendedor, setCarregandoSemVendedor] = useState(false);
  const [totalPaginasSemVendedor, setTotalPaginasSemVendedor] = useState(1);
  const [totalPaginasComVendedor, setTotalPaginasComVendedor] = useState(1);
  const [tabIndex, setTabIndex] = useState(0);
  const prevTotalPaginasComVendedor = useRef(1);
  const prevTotalPaginasSemVendedor = useRef(1);
  const inicializadoRef = useRef(false);

  // Estados para vendedores e migração
  const [vendedores, setVendedores] = useState<any[]>([]);
  const [novoVendedorId, setNovoVendedorId] = useState<string>("");
  const [migrando, setMigrando] = useState(false);
  const [refatorandoPurchaseFrequency, setRefatorandoPurchaseFrequency] =
    useState(false);
  const [checandoExpiradas, setChecandoExpiradas] = useState(false);
  const {
    isOpen: isOpenMigrate,
    onOpen: onOpenMigrate,
    onClose: onCloseMigrate,
  } = useDisclosure();

  // Função para calcular diferença em dias entre duas datas
  const calcularDiferencaEmDias = useCallback(
    (data1: Date, data2: Date): number => {
      const umDiaEmMilissegundos = 24 * 60 * 60 * 1000;
      const data1UTC = Date.UTC(
        data1.getFullYear(),
        data1.getMonth(),
        data1.getDate(),
      );
      const data2UTC = Date.UTC(
        data2.getFullYear(),
        data2.getMonth(),
        data2.getDate(),
      );
      return Math.floor((data2UTC - data1UTC) / umDiaEmMilissegundos);
    },
    [],
  );

  // Função para processar interações e definir cores e informações
  const processarInteracao = useCallback(
    (ultimaInteracao: any, dataAtual: Date) => {
      if (!ultimaInteracao) {
        return {
          proxima: null,
          cor: "gray",
          info: "Você não tem interação agendada",
          difDias: 500,
        };
      }

      // Função auxiliar para acessar campos que podem estar em attributes ou diretamente no objeto
      const getField = (obj: any, field: string) => {
        if (!obj) return undefined;
        return obj.attributes ? obj.attributes[field] : obj[field];
      };

      const proxima = getField(ultimaInteracao, "proxima");
      if (!proxima) {
        return {
          proxima: null,
          cor: "gray",
          info: "Você não tem interação agendada",
          difDias: 500,
        };
      }

      try {
        const proximaData = startOfDay(parseISO(proxima));
        const diferencaEmDias = calcularDiferencaEmDias(dataAtual, proximaData);

        if (getField(ultimaInteracao, "status_atendimento") === false) {
          return {
            proxima: null,
            cor: "gray",
            info: "Você não tem interação agendada",
            difDias: 500,
          };
        } else if (diferencaEmDias === 0) {
          return {
            proxima: proximaData.toISOString(),
            cor: "yellow",
            info: "Você tem interação agendada para hoje",
            difDias: diferencaEmDias,
          };
        } else if (diferencaEmDias < 0) {
          return {
            proxima: proximaData.toISOString(),
            cor: "#FC0707",
            info: `Você tem interação que já passou, a data agendada era ${proximaData.toLocaleDateString()}`,
            difDias: diferencaEmDias,
          };
        } else {
          return {
            proxima: proximaData.toISOString(),
            cor: "#3B2DFF",
            info: `Você tem interação agendada para ${proximaData.toLocaleDateString()}`,
            difDias: diferencaEmDias,
          };
        }
      } catch (error) {
        console.error("Erro ao processar interação:", error, ultimaInteracao);
        return {
          proxima: null,
          cor: "gray",
          info: "Erro ao processar interação",
          difDias: 500,
        };
      }
    },
    [calcularDiferencaEmDias],
  );

  // Função para processar empresas com vendedor
  const processarEmpresasComVendedor = useCallback(
    (
      empresasData: any[],
      username: string,
      dataAtual: Date,
      isAdmin: boolean,
    ) => {
      if (!empresasData || empresasData.length === 0) {
        return [];
      }

      // Para admin, mostrar todas as empresas com vendedor
      // Para usuários normais, filtrar apenas suas próprias empresas
      const filtroVendedor = isAdmin
        ? empresasData.filter((f) => f.attributes?.user?.data !== null)
        : empresasData.filter(
            (f) => f.attributes?.user?.data?.attributes?.username === username,
          );

      // Processar interações e ordenar
      const processados = filtroVendedor.map((empresa) => {
        const interacoes = empresa.attributes?.interacaos?.data || [];
        // Função auxiliar para acessar campos que podem estar em attributes ou diretamente no objeto
        const getInteracaoField = (interacao: any, field: string) => {
          if (!interacao) return undefined;
          return interacao.attributes
            ? interacao.attributes[field]
            : interacao[field];
        };

        // Primeiro, tentar encontrar interações do usuário atual
        const interacoesVendedor = interacoes.filter(
          (interacao: any) =>
            getInteracaoField(interacao, "vendedor_name") === username,
        );
        let ultimaInteracao = interacoesVendedor[interacoesVendedor.length - 1];

        // Se não houver interações do usuário, usar a última interação de qualquer vendedor
        // (especialmente útil para admin ver todas as interações)
        if (!ultimaInteracao && interacoes.length > 0) {
          ultimaInteracao = interacoes[interacoes.length - 1];
        }

        // Log para debug
        if (empresa.id === filtroVendedor[0]?.id) {
          console.log(
            "🔍 [PROCESSAR VENDEDOR] Primeira empresa:",
            empresa.attributes?.nome,
          );
          console.log("  - Total interações:", interacoes.length);
          console.log("  - Interações do usuário:", interacoesVendedor.length);
          console.log(
            "  - Última interação (do usuário):",
            ultimaInteracao ? "SIM" : "NÃO",
          );
          if (!ultimaInteracao && interacoes.length > 0) {
            console.log("  - Usando última interação de qualquer vendedor");
          }
        }

        const infoInteracao = processarInteracao(ultimaInteracao, dataAtual);

        return {
          id: empresa.id,
          attributes: {
            ...empresa.attributes,
            interacaos: {
              data: ultimaInteracao
                ? {
                    id: ultimaInteracao.id,
                    proxima: infoInteracao.proxima,
                    cor: infoInteracao.cor,
                    info: infoInteracao.info,
                    descricao:
                      getInteracaoField(ultimaInteracao, "descricao") || null,
                    tipo: getInteracaoField(ultimaInteracao, "tipo") || null,
                    objetivo:
                      getInteracaoField(ultimaInteracao, "objetivo") || null,
                    vendedor_name:
                      getInteracaoField(ultimaInteracao, "vendedor_name") ||
                      null,
                    createdAt:
                      getInteracaoField(ultimaInteracao, "createdAt") || null,
                  }
                : null,
            },
            diferencaEmDias: infoInteracao.difDias,
          },
        };
      });

      // Retornar empresas sem ordenação aqui - a ordenação será aplicada no useMemo localmente
      return processados;
    },
    [processarInteracao],
  );

  // Função para processar empresas sem vendedor
  const processarEmpresasSemVendedor = useCallback(
    (
      empresasData: any[],
      username: string,
      isAdmin: boolean,
      dataAtual: Date,
    ) => {
      // Função auxiliar para acessar campos que podem estar em attributes ou diretamente no objeto
      const getInteracaoField = (interacao: any, field: string) => {
        if (!interacao) return undefined;
        return interacao.attributes
          ? interacao.attributes[field]
          : interacao[field];
      };

      // Confiar no filtro do backend para empresas ausentes
      const filtroSemVendedor = empresasData;

      // Encontrar empresas sem vendedor mas com interações do usuário atual
      const empresasComInteracoesDoUsuario = filtroSemVendedor
        .filter((empresa) => {
          const interacoes = empresa.attributes?.interacaos?.data || [];
          return interacoes.some(
            (interacao: any) =>
              getInteracaoField(interacao, "vendedor_name") === username,
          );
        })
        .map((empresa) => {
          const interacoes = empresa.attributes?.interacaos?.data || [];
          const ultimaInteracao = interacoes[interacoes.length - 1];

          const infoInteracao = processarInteracao(ultimaInteracao, dataAtual);

          return {
            id: empresa.id,
            attributes: {
              ...empresa.attributes,
              interacaos: {
                data: {
                  id: ultimaInteracao?.id,
                  proxima: infoInteracao.proxima,
                  cor: infoInteracao.cor,
                  info: infoInteracao.info,
                  vendedor_name: getInteracaoField(
                    ultimaInteracao,
                    "vendedor_name",
                  ),
                  descricao:
                    getInteracaoField(ultimaInteracao, "descricao") || null,
                  tipo: getInteracaoField(ultimaInteracao, "tipo") || null,
                  objetivo:
                    getInteracaoField(ultimaInteracao, "objetivo") || null,
                  createdAt:
                    getInteracaoField(ultimaInteracao, "createdAt") || null,
                },
              },
              diferencaEmDias: infoInteracao.difDias,
            },
          };
        });

      // Empresas sem interações ou com interações de outros vendedores
      const empresasSemInteracoes = filtroSemVendedor
        .filter((f) => {
          const interacoes = f.attributes?.interacaos?.data || [];
          return interacoes.length === 0;
        })
        .map((empresa) => {
          return {
            id: empresa.id,
            attributes: {
              ...empresa.attributes,
              interacaos: {
                data: [],
              },
              diferencaEmDias: 500,
            },
          };
        });

      const empresasComInteracoesDeOutros = filtroSemVendedor
        .filter((empresa) => {
          const interacoes = empresa.attributes?.interacaos?.data || [];
          return (
            interacoes.length > 0 &&
            !interacoes.some(
              (interacao: any) =>
                getInteracaoField(interacao, "vendedor_name") === username,
            )
          );
        })
        .map((empresa) => {
          // Processar interação mesmo que seja de outro vendedor (para ter a cor)
          const interacoes = empresa.attributes?.interacaos?.data || [];
          const ultimaInteracao = interacoes[interacoes.length - 1];
          const infoInteracao = processarInteracao(ultimaInteracao, dataAtual);

          return {
            id: empresa.id,
            attributes: {
              ...empresa.attributes,
              interacaos: {
                data: {
                  id: ultimaInteracao?.id,
                  proxima: infoInteracao.proxima,
                  cor: infoInteracao.cor,
                  info: infoInteracao.info,
                  vendedor_name: getInteracaoField(
                    ultimaInteracao,
                    "vendedor_name",
                  ),
                  descricao:
                    getInteracaoField(ultimaInteracao, "descricao") || null,
                  tipo: getInteracaoField(ultimaInteracao, "tipo") || null,
                  objetivo:
                    getInteracaoField(ultimaInteracao, "objetivo") || null,
                  createdAt:
                    getInteracaoField(ultimaInteracao, "createdAt") || null,
                },
              },
              diferencaEmDias: infoInteracao.difDias,
            },
          };
        });

      // Combinar todas as empresas sem vendedor
      const todasEmpresas = [
        ...empresasComInteracoesDoUsuario,
        ...empresasSemInteracoes,
        ...empresasComInteracoesDeOutros,
      ];

      // Retornar empresas sem ordenação aqui - a ordenação será aplicada no useMemo localmente
      return todasEmpresas;
    },
    [processarInteracao],
  );

  // Carregar vendedores
  const carregarVendedores = useCallback(async () => {
    try {
      const res = await axios.get("/api/db/user/getGeral");
      // Filtrar apenas vendedores confirmados
      const vendedoresConfirmados = (res.data || []).filter(
        (v: any) => v.confirmed === true,
      );
      setVendedores(vendedoresConfirmados);
    } catch (error) {
      console.error("Erro ao carregar vendedores:", error);
    }
  }, []);

  // Carregar empresas com vendedor (minha carteira)
  const carregarEmpresasComVendedor = useCallback(
    async (pagina = 1) => {
      if (!session?.user.id) return;

      setCarregandoVendedor(true);
      try {
        const userId = filtroVendedorId || (isAdmin ? "" : session.user.id);
        const endpoint = `/api/db/empresas/empresalist/vendedor?userId=${userId}&page=${pagina}&filtro=${encodeURIComponent(filtroTexto)}&filtroCNAE=${encodeURIComponent(filtroCNAE)}&filtroCidade=${encodeURIComponent(filtroCidade)}&sort=${ordemClassificacao}`;

        const res = await axios(endpoint);

        const dataAtual = startOfDay(new Date());
        const empresasData = Array.isArray(res.data?.data) ? res.data.data : [];

        // Log para verificar dados recebidos no frontend
        console.log("🔍 [FRONTEND VENDEDOR] Dados recebidos da API:");
        console.log("  - Total de empresas:", empresasData.length);
        if (empresasData.length > 0) {
          const primeiraEmpresa = empresasData[0];
          console.log("  - Primeira empresa ID:", primeiraEmpresa?.id);
          console.log(
            "  - Primeira empresa nome:",
            primeiraEmpresa?.attributes?.nome,
          );
          console.log(
            "  - businesses existe?",
            !!primeiraEmpresa?.attributes?.businesses,
          );
          console.log(
            "  - businesses.data existe?",
            !!primeiraEmpresa?.attributes?.businesses?.data,
          );
          console.log(
            "  - businesses.data é array?",
            Array.isArray(primeiraEmpresa?.attributes?.businesses?.data),
          );
          console.log(
            "  - Quantidade businesses:",
            primeiraEmpresa?.attributes?.businesses?.data?.length || 0,
          );
          console.log(
            "  - interacaos existe?",
            !!primeiraEmpresa?.attributes?.interacaos,
          );
          console.log(
            "  - interacaos.data existe?",
            !!primeiraEmpresa?.attributes?.interacaos?.data,
          );
          console.log(
            "  - interacaos.data é array?",
            Array.isArray(primeiraEmpresa?.attributes?.interacaos?.data),
          );
          console.log(
            "  - Quantidade interacaos:",
            primeiraEmpresa?.attributes?.interacaos?.data?.length || 0,
          );
        }

        const processados = processarEmpresasComVendedor(
          empresasData,
          session.user.name,
          dataAtual,
          isAdmin,
        );

        const pagination = res.data?.meta?.pagination;
        const total = pagination?.total ?? empresasData.length;
        const pageSizeMeta = pagination?.pageSize ?? 50;
        const novoTotal = total > 0 ? Math.ceil(total / pageSizeMeta) : 1;

        setEmpresasComVendedor(processados);
        // Atualizar total de páginas apenas após atualizar os dados
        setTotalPaginasComVendedor(novoTotal);
      } catch (error) {
        console.error("Erro ao carregar empresas com vendedor:", error);
        toast({
          title: "Erro",
          description: "Erro ao carregar sua carteira de empresas",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setCarregandoVendedor(false);
      }
    },
    [
      session?.user.id,
      session?.user.name,
      processarEmpresasComVendedor,
      toast,
      isAdmin,
      filtroTexto,
      filtroCNAE,
      filtroCidade,
      filtroVendedorId,
      ordemClassificacao,
    ],
  );

  // Carregar empresas sem vendedor (carteira ausente)
  const carregarEmpresasSemVendedor = useCallback(
    async (pagina = 1, filtro = "") => {
      if (!session?.user.id) return;

      setCarregandoSemVendedor(true);
      try {
        const userIdParam =
          session?.user?.pemission === "Adm"
            ? filtroVendedorId
            : session?.user?.id;
        const userIdQuery = userIdParam
          ? `&userId=${encodeURIComponent(String(userIdParam))}`
          : "";

        // Empresas sem vendedor sempre ordenadas por relevância (não usa ordemClassificacao)
        const res = await axios(
          `/api/db/empresas/empresalist/ausente?page=${pagina}&filtro=${encodeURIComponent(filtro)}&filtroCNAE=${encodeURIComponent(filtroCNAE)}&filtroCidade=${encodeURIComponent(filtroCidade)}&sort=relevancia${userIdQuery}`,
        );

        // #region agent log
        fetch(
          "http://127.0.0.1:7244/ingest/9b56e505-01d3-49e7-afde-e83171883b39",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              location: "empresas/index.tsx:373",
              message: "Dados recebidos APÓS CORREÇÃO",
              data: {
                count: res.data?.data?.length,
                sample: res.data?.data
                  ?.slice(0, 2)
                  .map((e: any) => ({ id: e.id, nome: e.attributes?.nome })),
              },
              timestamp: Date.now(),
              sessionId: "debug-session",
              hypothesisId: "H5",
            }),
          },
        ).catch(() => {});
        // #endregion

        const dataAtual = startOfDay(new Date());
        const isAdmin = session.user.pemission === "Adm";

        const empresasData = Array.isArray(res.data?.data) ? res.data.data : [];

        const processados = processarEmpresasSemVendedor(
          empresasData,
          session.user.name,
          isAdmin,
          dataAtual,
        );

        // #region agent log
        fetch(
          "http://127.0.0.1:7244/ingest/9b56e505-01d3-49e7-afde-e83171883b39",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              location: "empresas/index.tsx:382",
              message: "Processados APÓS CORREÇÃO",
              data: {
                inputCount: empresasData.length,
                outputCount: processados.length,
              },
              timestamp: Date.now(),
              sessionId: "debug-session",
              hypothesisId: "H5",
            }),
          },
        ).catch(() => {});
        // #endregion

        const pagination = res.data?.meta?.pagination;
        const total = pagination?.total ?? empresasData.length;
        const pageSizeMeta = pagination?.pageSize ?? 50;
        const novoTotal = total > 0 ? Math.ceil(total / pageSizeMeta) : 1;

        setEmpresasSemVendedor(processados);
        setTotalPaginasSemVendedor(novoTotal);
      } catch (error) {
        console.error("Erro ao carregar empresas sem vendedor:", error);
        toast({
          title: "Erro",
          description: "Erro ao carregar empresas sem carteira definida",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setCarregandoSemVendedor(false);
      }
    },
    [
      session?.user.id,
      session?.user.name,
      session?.user.pemission,
      processarEmpresasSemVendedor,
      toast,
      filtroCNAE,
      filtroCidade,
      filtroVendedorId,
    ],
  );

  // Carregar dados iniciais - apenas carregar vendedores e marcar como inicializado
  useEffect(() => {
    if (session?.user.id && !inicializadoRef.current) {
      inicializadoRef.current = true;
      carregarVendedores();
      // Os carregamentos de empresas serão disparados pelos effects que dependem de paginaAtual e filtros
    }
  }, [session?.user.id, carregarVendedores]);

  // Carregar empresas com vendedor quando mudar paginação, filtro de texto, filtro de CNAE ou filtro de vendedor
  // NOTA: ordemClassificacao recarrega da API
  // IMPORTANTE: Ignorar se ainda não foi inicializado para evitar conflito com useEffect inicial
  useEffect(() => {
    if (session?.user.id && inicializadoRef.current) {
      carregarEmpresasComVendedor(paginaAtualComVendedor);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    paginaAtualComVendedor,
    filtroTexto,
    filtroCNAE,
    filtroCidade,
    filtroVendedorId,
    ordemClassificacao,
    session?.user.id,
  ]);

  // Carregar empresas sem vendedor quando mudar paginação, filtro de texto, filtro de CNAE ou filtro de vendedor
  // NOTA: ordemClassificacao NÃO afeta empresas sem vendedor (apenas ordenação local por nome)
  // IMPORTANTE: Ignorar se ainda não foi inicializado para evitar conflito com useEffect inicial
  useEffect(() => {
    if (session?.user.id && inicializadoRef.current) {
      carregarEmpresasSemVendedor(paginaAtualSemVendedor, filtroTexto);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    paginaAtualSemVendedor,
    filtroTexto,
    filtroCNAE,
    filtroCidade,
    filtroVendedorId,
    session?.user.id,
  ]);

  // Usar dados diretamente da API - ordenação já aplicada no backend
  const empresasComVendedorFiltradas = useMemo(() => {
    return empresasComVendedor;
  }, [empresasComVendedor]);

  // Usar dados diretamente da API - ordenação já aplicada no backend
  const empresasSemVendedorOrdenadas = useMemo(() => {
    return empresasSemVendedor;
  }, [empresasSemVendedor]);

  // Garantir que a página atual não seja maior que o total de páginas
  // Só ajustar quando o total mudar E a página atual for maior que o novo total
  // NÃO ajustar quando a página mudar (isso evita loops)
  useEffect(() => {
    // Apenas atualizar o ref para o valor atual do total de páginas
    prevTotalPaginasComVendedor.current = totalPaginasComVendedor;
  }, [totalPaginasComVendedor]);

  useEffect(() => {
    // Apenas atualizar o ref para o valor atual do total de páginas
    prevTotalPaginasSemVendedor.current = totalPaginasSemVendedor;
  }, [totalPaginasSemVendedor]);

  // Função para lidar com mudança de ordenação
  const handleOrdemClassificacaoChange = useCallback(
    (novaOrdem: "relevancia" | "expiracao") => {
      setOrdemClassificacao(novaOrdem);
      // Resetar paginação apenas para empresas com vendedor (ordenação só afeta essa aba)
      setPaginaAtualComVendedor(1);
    },
    [],
  );

  // Função para lidar com mudança de filtro de vendedor
  const handleFiltroVendedorChange = useCallback((vendedorId: string) => {
    setFiltroVendedorId(vendedorId);
    // Resetar paginação para ambas as abas quando o filtro mudar
    setPaginaAtualComVendedor(1);
    setPaginaAtualSemVendedor(1);
  }, []);

  // Função para migrar carteira em massa
  const handleMigrarCarteira = useCallback(async () => {
    if (!novoVendedorId) {
      toast({
        title: "Atenção",
        description: "Selecione um vendedor para migrar a carteira",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (!filtroVendedorId) {
      toast({
        title: "Atenção",
        description: "Selecione um vendedor para filtrar antes de migrar",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (filtroVendedorId === novoVendedorId) {
      toast({
        title: "Atenção",
        description: "O vendedor de origem e destino não podem ser os mesmos",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const empresaIds = empresasComVendedorFiltradas.map((emp) => emp.id);

    if (empresaIds.length === 0) {
      toast({
        title: "Atenção",
        description: "Nenhuma empresa encontrada para migrar",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setMigrando(true);
    try {
      const novoVendedor = vendedores.find(
        (v) => v.id === Number(novoVendedorId),
      );
      const response = await axios.post("/api/db/empresas/migrate-vendedor", {
        empresaIds,
        novoVendedorId,
        vendedorName: session?.user.name || "Sistema",
      });

      if (response.data.success) {
        toast({
          title: "Sucesso",
          description: `${response.data.updated} empresa(s) migrada(s) com sucesso para ${novoVendedor?.username || "novo vendedor"}`,
          status: "success",
          duration: 7000,
          isClosable: true,
        });

        // Recarregar dados
        carregarEmpresasComVendedor(paginaAtualComVendedor);
        setFiltroVendedorId("");
        setNovoVendedorId("");
        onCloseMigrate();
      } else {
        toast({
          title: "Atenção",
          description: `${response.data.updated} empresa(s) migrada(s), ${response.data.failed} falha(s)`,
          status: "warning",
          duration: 7000,
          isClosable: true,
        });
      }
    } catch (error: any) {
      console.error("Erro ao migrar carteira:", error);
      toast({
        title: "Erro",
        description: error.response?.data?.error || "Erro ao migrar carteira",
        status: "error",
        duration: 7000,
        isClosable: true,
      });
    } finally {
      setMigrando(false);
    }
  }, [
    novoVendedorId,
    filtroVendedorId,
    empresasComVendedorFiltradas,
    vendedores,
    session?.user.name,
    toast,
    carregarEmpresasComVendedor,
    paginaAtualComVendedor,
    onCloseMigrate,
  ]);

  // Função para lidar com o filtro de empresas
  const handleFiltroEmpresa = useCallback((searchText: string) => {
    setFiltroTexto((prev) => {
      if (prev === searchText) return prev;
      setPaginaAtualSemVendedor(1);
      setPaginaAtualComVendedor(1);
      return searchText;
    });
  }, []);

  // Efeito para mostrar aviso para empresas que pertencem a outros vendedores quando o filtro muda
  useEffect(() => {
    if (filtroTexto && !isAdmin) {
      const empresasDeOutrosVendedores = [
        ...empresasComVendedor,
        ...empresasSemVendedor,
      ].filter(
        (item) =>
          item.attributes.nome
            .toLowerCase()
            .includes(filtroTexto.toLowerCase()) &&
          item.attributes.user.data?.attributes.username !==
            session?.user.name &&
          item.attributes.user.data !== null,
      );

      empresasDeOutrosVendedores.forEach((empresa) => {
        const vendedor = empresa.attributes.user.data?.attributes.username;
        toast({
          title: "Opss",
          description: `O cliente ${empresa.attributes.nome}, pertence ao(à) vendedor(a) ${vendedor}`,
          status: "warning",
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroTexto, isAdmin, session?.user.name, toast]);

  // Função para lidar com o filtro de CNAE
  const handleFiltroCNAE = useCallback((cnaeText: string) => {
    setFiltroCNAE((prev) => {
      if (prev === cnaeText) return prev;
      setPaginaAtualSemVendedor(1);
      setPaginaAtualComVendedor(1);
      return cnaeText;
    });
    // Atualizar o valor do input quando chamado externamente (ex: ao clicar no badge)
    if (filtroCNAERef.current) {
      filtroCNAERef.current.setValue(cnaeText);
    }
  }, []);

  // Função para lidar com o filtro de cidade
  const handleFiltroCidade = useCallback((cidadeText: string) => {
    setFiltroCidade((prev) => {
      if (prev === cidadeText) return prev;
      setPaginaAtualSemVendedor(1);
      setPaginaAtualComVendedor(1);
      return cidadeText;
    });
    // Atualizar o valor do input quando chamado externamente (ex: ao clicar no badge)
    if (filtroCidadeRef.current) {
      filtroCidadeRef.current.setValue(cidadeText);
    }
  }, []);

  // Estado local para inputs de paginação (para evitar resets durante digitação)
  const [inputPaginaComVendedor, setInputPaginaComVendedor] =
    useState<string>("1");
  const [inputPaginaSemVendedor, setInputPaginaSemVendedor] =
    useState<string>("1");

  // Sincronizar inputs locais com estado de paginação
  useEffect(() => {
    setInputPaginaComVendedor(paginaAtualComVendedor.toString());
  }, [paginaAtualComVendedor]);

  useEffect(() => {
    setInputPaginaSemVendedor(paginaAtualSemVendedor.toString());
  }, [paginaAtualSemVendedor]);

  // Função para mudar de página para empresas sem vendedor
  const handlePaginacaoSemVendedor = useCallback((novaPagina: number) => {
    setPaginaAtualSemVendedor(novaPagina);
  }, []);

  // Função para mudar de página para empresas com vendedor
  const handlePaginacaoComVendedor = useCallback((novaPagina: number) => {
    setPaginaAtualComVendedor(novaPagina);
  }, []);

  // Função para refatorar purchaseFrequency
  const handleRefatorarPurchaseFrequency = useCallback(async () => {
    setRefatorandoPurchaseFrequency(true);
    try {
      let currentPage = 1;
      const pageSize = 50;
      let hasMore = true;
      let totalProcessed = 0;
      let totalUpdated = 0;
      let totalErrorsCount = 0;

      while (hasMore) {
        const response = await axios.post(
          "/api/refactory/companies/purchase-frequency",
          {
            page: currentPage,
            pageSize,
          },
        );
        const data = response.data;

        if (data.success) {
          totalProcessed += data.summary.processed;
          totalUpdated += data.summary.updated;
          totalErrorsCount += data.summary.errors;

          hasMore =
            data.pagination && data.pagination.page < data.pagination.pageCount;
          currentPage++;
        } else {
          throw new Error("Erro ao processar lote de refatoração");
        }
      }

      toast({
        title: "Refatoração concluída",
        description: `Processadas: ${totalProcessed} empresas | Atualizadas: ${totalUpdated} | Erros: ${totalErrorsCount}`,
        status: "success",
        duration: 10000,
        isClosable: true,
      });

      // Recarregar dados das empresas
      if (tabIndex === 0) {
        carregarEmpresasComVendedor(paginaAtualComVendedor);
      } else {
        carregarEmpresasSemVendedor(paginaAtualSemVendedor, filtroTexto);
      }
    } catch (error: any) {
      console.error("Erro ao refatorar purchase frequency:", error);
      toast({
        title: "Erro",
        description:
          error.response?.data?.error ||
          error.message ||
          "Erro ao refatorar frequência de compra",
        status: "error",
        duration: 7000,
        isClosable: true,
      });
    } finally {
      setRefatorandoPurchaseFrequency(false);
    }
  }, [
    toast,
    tabIndex,
    paginaAtualComVendedor,
    paginaAtualSemVendedor,
    filtroTexto,
    carregarEmpresasComVendedor,
    carregarEmpresasSemVendedor,
  ]);

  // Função para checar empresas expiradas
  const handleChecarExpiradas = useCallback(async () => {
    setChecandoExpiradas(true);
    try {
      let currentPage = 1;
      const pageSize = 100;
      let hasMore = true;
      let totalEmpresas = 0;
      let totalUpdated = 0;
      let totalNoChanges = 0;
      let totalFailed = 0;

      while (hasMore) {
        const response = await axios.get(
          `/api/db/empresas/check-expiration?page=${currentPage}&pageSize=${pageSize}`,
        );
        const data = response.data;

        if (data.success || data.pagination) {
          totalEmpresas = data.total;
          totalUpdated += data.updated;
          totalNoChanges += data.noChanges;
          totalFailed += data.failed;

          hasMore =
            data.pagination && data.pagination.page < data.pagination.pageCount;
          currentPage++;
        } else {
          throw new Error("Erro ao processar lote de expiração");
        }
      }

      toast({
        title: "Verificação concluída",
        description: `Total: ${totalEmpresas} empresas | Atualizadas: ${totalUpdated} | Sem alterações: ${totalNoChanges} | Erros: ${totalFailed}`,
        status: "success",
        duration: 10000,
        isClosable: true,
      });

      // Recarregar dados das empresas
      if (tabIndex === 0) {
        carregarEmpresasComVendedor(paginaAtualComVendedor);
      } else {
        carregarEmpresasSemVendedor(paginaAtualSemVendedor, filtroTexto);
      }
    } catch (error: any) {
      console.error("Erro ao checar empresas expiradas:", error);
      toast({
        title: "Erro",
        description:
          error.response?.data?.error ||
          error.message ||
          "Erro ao verificar empresas expiradas",
        status: "error",
        duration: 7000,
        isClosable: true,
      });
    } finally {
      setChecandoExpiradas(false);
    }
  }, [
    toast,
    tabIndex,
    paginaAtualComVendedor,
    paginaAtualSemVendedor,
    filtroTexto,
    carregarEmpresasComVendedor,
    carregarEmpresasSemVendedor,
  ]);

  return (
    <>
      <Box
        w={"100%"}
        h={"100%"}
        bg={"gray.800"}
        color={"white"}
        px={5}
        py={2}
        fontSize={"0.8rem"}
        display="flex"
        flexDirection="column"
      >
        <Heading size={"lg"}>Empresas</Heading>
        <Flex
          w={"100%"}
          py={"1rem"}
          justifyContent={"space-between"}
          flexDir={"row"}
          alignItems={"self-end"}
          px={6}
          gap={6}
          borderBottom={"1px"}
          borderColor={"white"}
          mb={"1rem"}
          flexWrap="wrap"
        >
          <Flex gap={4} alignItems={"flex-end"} flexWrap="wrap">
            <Box minW="150px" flexShrink={0}>
              <FiltroEmpresa empresa={handleFiltroEmpresa} />
            </Box>
            <Box minW="150px" flexShrink={0}>
              <FiltroCNAE ref={filtroCNAERef} cnae={handleFiltroCNAE} />
            </Box>
            <Box minW="150px" flexShrink={0}>
              <FiltroCidade ref={filtroCidadeRef} cidade={handleFiltroCidade} />
            </Box>
            {tabIndex === 0 && (
              <Box minW="150px" flexShrink={0}>
                <FormLabel fontSize="xs" fontWeight="md">
                  Ordenar por
                </FormLabel>
                <Select
                  size="sm"
                  borderColor="white"
                  focusBorderColor="white"
                  rounded="md"
                  value={ordemClassificacao}
                  onChange={(e) =>
                    handleOrdemClassificacaoChange(
                      e.target.value as "relevancia" | "expiracao",
                    )
                  }
                  w="150px"
                  minW="150px"
                >
                  <option
                    value="relevancia"
                    style={{ backgroundColor: "#1A202C", color: "white" }}
                  >
                    Relevância
                  </option>
                  <option
                    value="expiracao"
                    style={{ backgroundColor: "#1A202C", color: "white" }}
                  >
                    Data de expiração
                  </option>
                </Select>
              </Box>
            )}
            {isAdmin && (
              <Box minW="200px" flexShrink={0}>
                <FormLabel fontSize="xs" fontWeight="md">
                  Filtrar por Vendedor
                </FormLabel>
                <Select
                  size="sm"
                  borderColor="white"
                  focusBorderColor="white"
                  rounded="md"
                  value={filtroVendedorId || ""}
                  onChange={(e) => handleFiltroVendedorChange(e.target.value)}
                  w="200px"
                  minW="200px"
                  sx={{
                    "& option": {
                      backgroundColor: "#1A202C !important",
                      color: "white !important",
                    },
                    "& option:hover": {
                      backgroundColor: "#2D3748 !important",
                      color: "white !important",
                    },
                    "& option:checked": {
                      backgroundColor: "#2D3748 !important",
                      color: "white !important",
                    },
                  }}
                >
                  <option
                    value=""
                    style={{ backgroundColor: "#1A202C", color: "white" }}
                  >
                    Todos os vendedores
                  </option>
                  {vendedores.map((vendedor: any) => (
                    <option
                      key={vendedor.id}
                      value={vendedor.id}
                      style={{ backgroundColor: "#1A202C", color: "white" }}
                    >
                      {vendedor.username}
                    </option>
                  ))}
                </Select>
              </Box>
            )}
            {isAdmin &&
              tabIndex === 0 &&
              filtroVendedorId &&
              empresasComVendedorFiltradas.length > 0 && (
                <Button
                  size={"sm"}
                  onClick={onOpenMigrate}
                  colorScheme="orange"
                  whiteSpace="normal"
                  wordBreak="break-word"
                  minW="fit-content"
                  flexShrink={0}
                >
                  Migrar Carteira ({empresasComVendedorFiltradas.length})
                </Button>
              )}
          </Flex>
          <Flex gap={2} alignItems={"flex-end"} flexWrap="wrap">
            {isAdmin && (
              <>
                <Button
                  size={"sm"}
                  onClick={handleRefatorarPurchaseFrequency}
                  colorScheme="purple"
                  whiteSpace="normal"
                  wordBreak="break-word"
                  minW="fit-content"
                  flexShrink={0}
                  isLoading={refatorandoPurchaseFrequency}
                  loadingText="Refatorando..."
                >
                  Refatorar Frequência
                </Button>
                <Button
                  size={"sm"}
                  onClick={handleChecarExpiradas}
                  colorScheme="orange"
                  whiteSpace="normal"
                  wordBreak="break-word"
                  minW="fit-content"
                  flexShrink={0}
                  isLoading={checandoExpiradas}
                  loadingText="Verificando..."
                >
                  Checar Expiradas
                </Button>
              </>
            )}
            <Button
              size={"sm"}
              onClick={() => router.push("/empresas/cadastro")}
              colorScheme="green"
              whiteSpace="normal"
              wordBreak="break-word"
              minW="fit-content"
              flexShrink={0}
            >
              + Nova Empresa
            </Button>
          </Flex>
        </Flex>
        <Tabs
          colorScheme="blue"
          w={"100%"}
          flex="1"
          display="flex"
          flexDirection="column"
          overflowY="auto"
          variant="unstyled"
          index={tabIndex}
          onChange={setTabIndex}
        >
          <Flex
            justifyContent="space-between"
            alignItems="flex-end"
            mb={0}
            borderBottom="2px solid #ffffff"
          >
            <TabList flex="1" borderBottom="none">
              <Tab
                fontWeight="semibold"
                bg="transparent"
                borderColor="rgba(255, 255, 255, 0.5)"
                borderBottom="none"
                _selected={{
                  bg: "blue.600",
                  color: "white",
                  borderTop: "2px solid #ffffff",
                  borderLeft: "2px solid #ffffff",
                  borderRight: "2px solid #ffffff",
                  borderBottom: "none",
                }}
              >
                Todas as empresas com vendedor
              </Tab>
              <Tab
                fontWeight="semibold"
                bg="transparent"
                borderColor="rgba(255, 255, 255, 0.5)"
                borderBottom="none"
                _selected={{
                  bg: "blue.600",
                  color: "white",
                  borderTop: "2px solid #ffffff",
                  borderLeft: "2px solid #ffffff",
                  borderRight: "2px solid #ffffff",
                  borderBottom: "none",
                }}
              >
                Empresas sem carteira definida
              </Tab>
            </TabList>
            <Box pb={2}>
              {tabIndex === 0 ? (
                totalPaginasComVendedor <= 1 ? null : (
                  <Flex alignItems="flex-end" justifyContent="flex-end">
                    <HStack spacing={2}>
                      <Button
                        size="xs"
                        bg="#2b6cb0"
                        color="white"
                        _hover={{ bg: "#2c5282" }}
                        _active={{ bg: "#2a4365" }}
                        _disabled={{
                          bg: "#1a365d",
                          opacity: 0.5,
                          cursor: "not-allowed",
                        }}
                        onClick={() =>
                          handlePaginacaoComVendedor(
                            Math.max(1, paginaAtualComVendedor - 1),
                          )
                        }
                        isDisabled={
                          paginaAtualComVendedor === 1 || carregandoVendedor
                        }
                      >
                        <FaAngleDoubleLeft />
                      </Button>
                      <Text fontSize="xs">Ir para página:</Text>
                      <Input
                        type="number"
                        min={1}
                        max={totalPaginasComVendedor}
                        size="xs"
                        width="50px"
                        textAlign="center"
                        borderRadius="md"
                        value={inputPaginaComVendedor}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const value = e.target.value;
                          setInputPaginaComVendedor(value);
                          const num = parseInt(value, 10);
                          if (
                            !isNaN(num) &&
                            num >= 1 &&
                            num <= totalPaginasComVendedor
                          ) {
                            handlePaginacaoComVendedor(num);
                          }
                        }}
                        onKeyPress={(
                          e: React.KeyboardEvent<HTMLInputElement>,
                        ) => {
                          if (e.key === "Enter") {
                            const num = parseInt(
                              (e.target as HTMLInputElement).value,
                              10,
                            );
                            if (
                              !isNaN(num) &&
                              num >= 1 &&
                              num <= totalPaginasComVendedor
                            ) {
                              handlePaginacaoComVendedor(num);
                            } else {
                              setInputPaginaComVendedor(
                                paginaAtualComVendedor.toString(),
                              );
                            }
                          }
                        }}
                        onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                          const num = parseInt(e.target.value, 10);
                          if (
                            isNaN(num) ||
                            num < 1 ||
                            num > totalPaginasComVendedor
                          ) {
                            setInputPaginaComVendedor(
                              paginaAtualComVendedor.toString(),
                            );
                          }
                        }}
                      />
                      <Text fontSize="xs">de {totalPaginasComVendedor}</Text>
                      <Button
                        size="xs"
                        bg="#2b6cb0"
                        color="white"
                        _hover={{ bg: "#2c5282" }}
                        _active={{ bg: "#2a4365" }}
                        _disabled={{
                          bg: "#1a365d",
                          opacity: 0.5,
                          cursor: "not-allowed",
                        }}
                        onClick={() =>
                          handlePaginacaoComVendedor(
                            Math.min(
                              totalPaginasComVendedor,
                              paginaAtualComVendedor + 1,
                            ),
                          )
                        }
                        isDisabled={
                          paginaAtualComVendedor === totalPaginasComVendedor ||
                          carregandoVendedor
                        }
                      >
                        <FaAngleDoubleRight />
                      </Button>
                    </HStack>
                  </Flex>
                )
              ) : totalPaginasSemVendedor <= 1 ? null : (
                <Flex alignItems="flex-end" justifyContent="flex-end">
                  <HStack spacing={2}>
                    <Button
                      size="xs"
                      bg="#2b6cb0"
                      color="white"
                      _hover={{ bg: "#2c5282" }}
                      _active={{ bg: "#2a4365" }}
                      _disabled={{
                        bg: "#1a365d",
                        opacity: 0.5,
                        cursor: "not-allowed",
                      }}
                      onClick={() =>
                        handlePaginacaoSemVendedor(
                          Math.max(1, paginaAtualSemVendedor - 1),
                        )
                      }
                      isDisabled={
                        paginaAtualSemVendedor === 1 || carregandoSemVendedor
                      }
                    >
                      <FaAngleDoubleLeft />
                    </Button>
                    <Text fontSize="xs">Ir para página:</Text>
                    <Input
                      type="number"
                      min={1}
                      max={totalPaginasSemVendedor}
                      size="xs"
                      width="50px"
                      textAlign="center"
                      borderRadius="md"
                      value={inputPaginaSemVendedor}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const value = e.target.value;
                        setInputPaginaSemVendedor(value);
                        const num = parseInt(value, 10);
                        if (
                          !isNaN(num) &&
                          num >= 1 &&
                          num <= totalPaginasSemVendedor
                        ) {
                          handlePaginacaoSemVendedor(num);
                        }
                      }}
                      onKeyPress={(
                        e: React.KeyboardEvent<HTMLInputElement>,
                      ) => {
                        if (e.key === "Enter") {
                          const num = parseInt(
                            (e.target as HTMLInputElement).value,
                            10,
                          );
                          if (
                            !isNaN(num) &&
                            num >= 1 &&
                            num <= totalPaginasSemVendedor
                          ) {
                            handlePaginacaoSemVendedor(num);
                          } else {
                            setInputPaginaSemVendedor(
                              paginaAtualSemVendedor.toString(),
                            );
                          }
                        }
                      }}
                      onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                        const num = parseInt(e.target.value, 10);
                        if (
                          isNaN(num) ||
                          num < 1 ||
                          num > totalPaginasSemVendedor
                        ) {
                          setInputPaginaSemVendedor(
                            paginaAtualSemVendedor.toString(),
                          );
                        }
                      }}
                    />
                    <Text fontSize="xs">de {totalPaginasSemVendedor}</Text>
                    <Button
                      size="xs"
                      bg="#2b6cb0"
                      color="white"
                      _hover={{ bg: "#2c5282" }}
                      _active={{ bg: "#2a4365" }}
                      _disabled={{
                        bg: "#1a365d",
                        opacity: 0.5,
                        cursor: "not-allowed",
                      }}
                      onClick={() =>
                        handlePaginacaoSemVendedor(
                          Math.min(
                            totalPaginasSemVendedor,
                            paginaAtualSemVendedor + 1,
                          ),
                        )
                      }
                      isDisabled={
                        paginaAtualSemVendedor === totalPaginasSemVendedor ||
                        carregandoSemVendedor
                      }
                    >
                      <FaAngleDoubleRight />
                    </Button>
                  </HStack>
                </Flex>
              )}
            </Box>
          </Flex>

          <TabPanels
            flex="1"
            display="flex"
            flexDirection="column"
            minH={0}
            sx={{
              "&::-webkit-scrollbar": {
                width: "10px",
              },
              "&::-webkit-scrollbar-track": {
                background: "#1A202C",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "#4A5568",
                borderRadius: "5px",
              },
              "&::-webkit-scrollbar-thumb:hover": {
                background: "#718096",
              },
            }}
          >
            <TabPanel
              px={0}
              py={4}
              flex="1"
              display="flex"
              flexDirection="column"
              minH={0}
            >
              <CarteiraVendedor
                filtro={empresasComVendedorFiltradas}
                isLoading={carregandoVendedor}
                showVendedor={isAdmin}
                paginaAtual={paginaAtualComVendedor}
                totalPaginas={totalPaginasComVendedor}
                onChangePagina={handlePaginacaoComVendedor}
                onFilterByCNAE={handleFiltroCNAE}
                onFilterByCidade={handleFiltroCidade}
              />
            </TabPanel>
            <TabPanel
              px={0}
              py={4}
              flex="1"
              display="flex"
              flexDirection="column"
              minH={0}
            >
              <CarteiraAusente
                filtro={empresasSemVendedorOrdenadas}
                isLoading={carregandoSemVendedor}
                paginaAtual={paginaAtualSemVendedor}
                totalPaginas={totalPaginasSemVendedor}
                onChangePagina={handlePaginacaoSemVendedor}
                onFilterByCNAE={handleFiltroCNAE}
                onFilterByCidade={handleFiltroCidade}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Modal de Migração de Carteira */}
        <Modal isOpen={isOpenMigrate} onClose={onCloseMigrate} size="md">
          <ModalOverlay />
          <ModalContent bg="gray.800" color="white">
            <ModalHeader>Migrar Carteira de Vendedor</ModalHeader>
            <ModalBody>
              <Text mb={4}>
                Você está prestes a migrar {empresasComVendedorFiltradas.length}{" "}
                empresa(s) do vendedor selecionado.
              </Text>
              <FormLabel fontSize="sm" fontWeight="md" mt={4}>
                Selecione o novo vendedor:
              </FormLabel>
              <Select
                size="sm"
                borderColor="white"
                focusBorderColor="white"
                rounded="md"
                value={novoVendedorId}
                onChange={(e) => setNovoVendedorId(e.target.value)}
                placeholder="Selecione um vendedor"
                mt={2}
              >
                {vendedores
                  .filter((v: any) => v.id !== Number(filtroVendedorId))
                  .map((vendedor: any) => (
                    <option
                      key={vendedor.id}
                      value={vendedor.id}
                      style={{ backgroundColor: "#1A202C", color: "white" }}
                    >
                      {vendedor.username}
                    </option>
                  ))}
              </Select>
            </ModalBody>
            <ModalFooter>
              <Button
                colorScheme="gray"
                mr={3}
                onClick={onCloseMigrate}
                isDisabled={migrando}
              >
                Cancelar
              </Button>
              <Button
                colorScheme="orange"
                onClick={handleMigrarCarteira}
                isLoading={migrando}
                isDisabled={!novoVendedorId}
              >
                Migrar Carteira
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </>
  );
}

export default Empresas;
