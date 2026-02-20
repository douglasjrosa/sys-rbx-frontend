import AditionalCosts from "@/components/aditionalCosts";
import AditionalDiscount from "@/components/adtitionalDiscount";
import DeliverDate from "@/components/deliverDate";
import EmitenteSelect from "@/components/emitenteSelect";
import PaymentTerms from "@/components/paymentTerms";
import Link from "next/link";
import FreightCost from "@/components/freightCost";
import FreightSelect from "@/components/freightSelect";
import TableItems from "@/components/tableItems";
import { DynamicDiscounts } from "@/components/Proposta/DynamicDiscounts";
import { customDateIso } from "@/utils/customDateFunctions";
import {
  Box,
  Button,
  Flex,
  FormLabel,
  Heading,
  Input,
  Text,
  Textarea,
  chakra,
  useToast,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaShoppingCart } from "react-icons/fa";
import { formatCurrency, parseCurrency } from "@/utils/customNumberFormats";
import { formatCompanyDisplayName } from "@/utils/formatCompanyName";
import { emitentes } from "@/components/data/emitentes";
import { Z_INDEX } from "@/utils/zIndex";

const Proposta = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [user, setUser] = useState<any>();

  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const { businessId } = router.query;
  // Fallback: extract from URL when router.query not ready (Next.js hydration)
  const businessIdFromPath = router.asPath.split("/").pop()?.split("?")[0];
  const rawId = Array.isArray(businessId) ? businessId[0] : businessId;
  const effectiveBusinessId = String(rawId || businessIdFromPath || "");

  const FORM_STORAGE_KEY = (id: string) => `proposal_form_${id}`;
  const ITEMS_STORAGE_KEY = (id: string) => `proposal_items_${id}`;
  const DISCOUNTS_STORAGE_KEY = (id: string) =>
    `proposal_dynamic_discounts_${id}`;

  const [enableFetches, setEnableFetches] = useState<string>("not yet allowed");

  const [deliverDate, setDeliverDate] = useState(customDateIso(7));

  const [accountsData, setAccountsData] = useState<any[]>();
  const [businessData, setBusinessData] = useState<any[]>();
  const [emitenteCnpj, setEmitenteCnpj] = useState("");
  const [emitenteId, setEmitenteId] = useState("");
  const [companyData, setCompanyData] = useState<any>();
  const [orderData, setOrderData] = useState<any>();

  const [paymentTerms, setPaymentTerms] = useState<string>("1");
  const [freightCost, setFreightCost] = useState(0);
  const [freightType, setFreightType] = useState("FOB");

  const [aditionalDiscount, setAditionalDiscount] = useState(0);
  const [dynamicDiscount, setDynamicDiscount] = useState(0);
  const [manualDiscount, setManualDiscount] = useState(0);
  const [resetAllDynamicDiscounts, setResetAllDynamicDiscounts] = useState(false);

  const handleDynamicDiscountChange = useCallback((discountValue: number) => {
    setDynamicDiscount(discountValue);
    if (discountValue > 0) {
      setManualDiscount(0);
      setResetAllDynamicDiscounts(false);
    }
  }, []);

  const handleDynamicManualChange = useCallback((manualValue: number) => {
    if (manualValue > 0) {
      setManualDiscount(0);
      setResetAllDynamicDiscounts(false);
    }
  }, []);

  const handleManualDiscountChangeHeader = useCallback(
    (value: number | ((prev: number) => number)) => {
      const num = typeof value === "function" ? value(manualDiscount) : value;
      setManualDiscount(num);
      if (num > 0) {
        setResetAllDynamicDiscounts(true);
      } else {
        setResetAllDynamicDiscounts(false);
      }
    },
    [manualDiscount],
  );

  useEffect(() => {
    setAditionalDiscount(manualDiscount + dynamicDiscount);
  }, [manualDiscount, dynamicDiscount]);
  const [aditionalCosts, setAditionalCosts] = useState(0);
  const [subtotal, setSubtotal] = useState(0);

  const [clientOrderNumber, setClientOrderNumber] = useState("");
  const [orderObservations, setOrderObservations] = useState("");

  const [itemsList, setItemsList] = useState<any[]>([]);

  const [orderTotalValue, setOrderTotalValue] = useState("0,00");
  const [orderSaveData, setOrderSaveData] = useState<any>();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, []);

  if (status === "authenticated" && !user) {
    setUser(session.user);
  }

  const fetchBusiness = useCallback(async () => {
    const id = effectiveBusinessId || businessId;
    if (!id) return { businessData: null, companyData: null, orderData: null };
    const response = await fetch(
      `/api/strapi/businesses/${id}?populate=*`,
    );
    const business = await response.json();

    const businessData = business.data;
    if (!businessData) return { businessData: null, companyData: null, orderData: null };

    const companyData = businessData.attributes?.empresa?.data;

    const pedidosData = businessData.attributes?.pedidos?.data;
    const [pedido] = pedidosData ?? [];
    const orderData = pedido;

    return { businessData, companyData, orderData };
  }, [businessId, effectiveBusinessId]);

  const fetchAccounts = useCallback(async () => {
    const response = await fetch("/api/strapi/tokens");

    if (!response.ok) console.error(response);

    const accounts = await response.json();

    return [
      { attributes: { cnpj: "", account: "Selecione um emitente" } },
      ...accounts.data,
    ];
  }, []);

  useEffect(() => {
    const subtotal = parseCurrency(
      itemsList
        .map((i) => parseCurrency(i.total))
        .reduce((acc, curr) => acc + curr, 0),
    );
    setSubtotal(subtotal);

    const totalValue =
      subtotal +
      parseCurrency(aditionalCosts) -
      parseCurrency(aditionalDiscount) +
      parseCurrency(freightCost);

    setOrderTotalValue(formatCurrency(totalValue));
  }, [itemsList, freightCost, aditionalDiscount, aditionalCosts]);

  useEffect(() => {
    (async () => {
      if (enableFetches === "not yet allowed") setEnableFetches("allow");

      if (enableFetches === "allow") {
        if (effectiveBusinessId && !companyData?.attributes?.nome) {
          setEnableFetches("disallow");
          const [accountsData, fetchBusinessResponse] = await Promise.all([
            fetchAccounts(),
            fetchBusiness(),
          ]);
          setAccountsData(accountsData);
          setBusinessData(fetchBusinessResponse.businessData);
          setCompanyData(fetchBusinessResponse.companyData);
          setOrderData(fetchBusinessResponse.orderData);
          if (orderData?.attributes?.frete)
            setFreightType(orderData.attributes.frete);
          if (orderData?.attributes?.valorFrete)
            setFreightCost(orderData.attributes.valorFrete);
        }
      }
    })();
  }, [effectiveBusinessId, fetchBusiness, enableFetches]);

  const fetchEmitenteId = useCallback(async () => {
    if (!!companyData) {
      if (!orderData && !emitenteCnpj && !!companyData?.attributes?.CNPJ) {
        const clientCnpj = companyData.attributes.CNPJ;
        const emitenteCnpj =
          emitentes[clientCnpj]?.emitente ?? emitentes.default.emitente;

        if (emitenteCnpj) setEmitenteCnpj(emitenteCnpj);
      }

      if (!!emitenteCnpj) {
        const response = await fetch(
          `/api/strapi/empresas?filters[CNPJ]=${emitenteCnpj}`,
        );
        const emitente = await response.json();
        const [emitenteData] = emitente.data;
        setEmitenteId(emitenteData.id);
      }
    }
  }, [companyData, orderData, emitenteCnpj]);

  useEffect(() => {
    fetchEmitenteId();
  }, [fetchEmitenteId]);

  const hasFormLoadedRef = useRef(false);
  const hasItemsLoadedRef = useRef(false);

  // Load form fields from localStorage (runs first, before save)
  useEffect(() => {
    if (!effectiveBusinessId || typeof localStorage === "undefined") return;
    hasFormLoadedRef.current = false;
    const stored = localStorage.getItem(FORM_STORAGE_KEY(effectiveBusinessId));
    if (stored) {
      try {
        const form = JSON.parse(stored);
        if (form.emitenteCnpj !== undefined) setEmitenteCnpj(form.emitenteCnpj);
        if (form.deliverDate !== undefined) setDeliverDate(form.deliverDate);
        if (form.paymentTerms !== undefined) setPaymentTerms(form.paymentTerms);
        if (form.freightType !== undefined) setFreightType(form.freightType);
        if (form.freightCost !== undefined)
          setFreightCost(Number(form.freightCost));
        if (form.manualDiscount !== undefined)
          setManualDiscount(Number(form.manualDiscount));
        if (form.aditionalCosts !== undefined)
          setAditionalCosts(Number(form.aditionalCosts));
        if (form.clientOrderNumber !== undefined)
          setClientOrderNumber(form.clientOrderNumber);
        if (form.orderObservations !== undefined)
          setOrderObservations(form.orderObservations);
      } catch {
        /* ignore parse errors */
      }
    }
    // Delay flag so save effect skips this render (state not updated yet)
    queueMicrotask(() => {
      hasFormLoadedRef.current = true;
    });
  }, [effectiveBusinessId]);

  // Save form fields to localStorage only AFTER initial load (avoids overwriting with defaults)
  useEffect(() => {
    if (
      !effectiveBusinessId ||
      typeof localStorage === "undefined" ||
      !hasFormLoadedRef.current
    )
      return;
    const form = {
      emitenteCnpj,
      deliverDate,
      paymentTerms,
      freightType,
      freightCost,
      manualDiscount,
      aditionalCosts,
      clientOrderNumber,
      orderObservations,
    };
    localStorage.setItem(
      FORM_STORAGE_KEY(effectiveBusinessId),
      JSON.stringify(form),
    );
  }, [
    effectiveBusinessId,
    emitenteCnpj,
    deliverDate,
    paymentTerms,
    freightType,
    freightCost,
    manualDiscount,
    aditionalCosts,
    clientOrderNumber,
    orderObservations,
  ]);

  // Load items from localStorage (runs first, before save)
  useEffect(() => {
    if (!effectiveBusinessId || typeof localStorage === "undefined") return;
    hasItemsLoadedRef.current = false;
    const stored = localStorage.getItem(ITEMS_STORAGE_KEY(effectiveBusinessId));
    if (stored) {
      try {
        const items = JSON.parse(stored);
        if (Array.isArray(items) && items.length > 0) {
          setItemsList(items);
        }
      } catch {
        /* ignore parse errors */
      }
    }
    queueMicrotask(() => {
      hasItemsLoadedRef.current = true;
    });
  }, [effectiveBusinessId]);

  // Save items to localStorage only AFTER initial load (avoids overwriting with defaults)
  // MUST run before recovery effect so that intentional delete (itemsList=[]) is persisted first
  useEffect(() => {
    if (
      !effectiveBusinessId ||
      typeof localStorage === "undefined" ||
      !hasItemsLoadedRef.current
    )
      return;
    localStorage.setItem(
      ITEMS_STORAGE_KEY(effectiveBusinessId),
      JSON.stringify(itemsList),
    );
  }, [effectiveBusinessId, itemsList]);

  // Recovery: if itemsList is empty but localStorage has items, load them
  // Runs AFTER save effect so intentional delete (last item) is saved before recovery reads
  useEffect(() => {
    if (
      itemsList.length === 0 &&
      effectiveBusinessId &&
      typeof localStorage !== "undefined"
    ) {
      const stored = localStorage.getItem(
        ITEMS_STORAGE_KEY(effectiveBusinessId),
      );
      if (stored) {
        try {
          const items = JSON.parse(stored);
          if (Array.isArray(items) && items.length > 0) {
            setItemsList(items);
          }
        } catch {
          /* ignore */
        }
      }
    }
  }, [itemsList.length, effectiveBusinessId]);

  useEffect(() => {
    // First loading data from db - use effectiveBusinessId (query or path fallback)
    if (orderData && effectiveBusinessId) {
      const {
        dataEntrega,
        fornecedor,
        prazo,
        valorFrete,
        frete,
        descontoTotal,
        cliente_pedido,
        obs,
        itens,
      } = orderData.attributes;

      // Prefer localStorage form data (user edits) over orderData
      const storedForm = localStorage.getItem(
        FORM_STORAGE_KEY(effectiveBusinessId),
      );
      let form: Record<string, unknown> = {};
      if (storedForm) {
        try {
          form = JSON.parse(storedForm);
        } catch {
          /* ignore */
        }
      }
      setDeliverDate(
        (form.deliverDate as string) || dataEntrega || customDateIso(7),
      );
      setEmitenteCnpj((form.emitenteCnpj as string) || fornecedor || "");
      setPaymentTerms((form.paymentTerms as string) || prazo || "1");
      setFreightCost(
        form.freightCost !== undefined
          ? Number(form.freightCost)
          : valorFrete
            ? parseCurrency(valorFrete)
            : 0,
      );
      setFreightType((form.freightType as string) || frete || "FOB");
      setManualDiscount(
        form.manualDiscount !== undefined
          ? Number(form.manualDiscount)
          : descontoTotal !== undefined && descontoTotal !== null
            ? parseCurrency(descontoTotal)
            : 0,
      );
      setClientOrderNumber(
        (form.clientOrderNumber as string) ?? cliente_pedido ?? "",
      );
      setAditionalCosts(
        form.aditionalCosts !== undefined
          ? Number(form.aditionalCosts)
          : orderData.attributes?.custoAdicional
            ? parseCurrency(orderData.attributes.custoAdicional)
            : 0,
      );
      setOrderObservations((form.orderObservations as string) ?? obs ?? "");
      
      // Tenta carregar do localStorage primeiro (itens em edição no cliente)
      const storedItems = localStorage.getItem(
        ITEMS_STORAGE_KEY(effectiveBusinessId),
      );
      const parsedItens = typeof itens === "string" ? (() => {
        try { return JSON.parse(itens); } catch { return itens; }
      })() : itens;
      const itensArray = Array.isArray(parsedItens) ? parsedItens : [];
      if (storedItems) {
        try {
          const items = JSON.parse(storedItems);
          if (Array.isArray(items)) {
            setItemsList(items);
          } else if (itensArray.length > 0) {
            setItemsList(itensArray);
          }
        } catch (e) {
          console.error("Erro ao carregar itens do localStorage:", e);
          itensArray.length > 0 && setItemsList(itensArray);
        }
      } else if (itensArray.length > 0) {
        setItemsList(itensArray);
      }
    } else if (effectiveBusinessId) {
      // When orderData is undefined (new proposal or returning from product selection),
      // load items from localStorage so "Finalizar Seleção" flow works correctly
      const storedItems = localStorage.getItem(
        ITEMS_STORAGE_KEY(effectiveBusinessId),
      );
      if (storedItems) {
        try {
          const items = JSON.parse(storedItems);
          if (Array.isArray(items) && items.length > 0) {
            setItemsList(items);
          }
        } catch (e) {
          console.error("Erro ao carregar itens do localStorage:", e);
        }
      }
    }
  }, [orderData, businessId, effectiveBusinessId]);

  useEffect(() => {
    // Updating data object to save later
    if (companyData) {
      if (companyData.attributes.emailNfe === "") {
        router.push(`/empresas/atualizar/${companyData.id}`);
      }

      const saveData = {
        businessId,
        business: businessId,
        fornecedor: emitenteCnpj,
        fornecedorId: emitenteId,
        empresa: companyData.id,
        empresaId: companyData.id,
        CNPJClinet: companyData.attributes.CNPJ,
        dataPedido: customDateIso(),
        dataEntrega: deliverDate,
        prazo: paymentTerms === "0" ? "1" : paymentTerms,
        condi: paymentTerms === "0" ? "À vista (antecipado)" : "A prazo",
        frete: freightType,
        valorFrete: formatCurrency(freightCost),
        descontoTotal: formatCurrency(aditionalDiscount),
        desconto: formatCurrency(aditionalDiscount),
        custoAdicional: formatCurrency(aditionalCosts),
        itens: itemsList,
        cliente_pedido: clientOrderNumber,
        obs: orderObservations,
        totalGeral: orderTotalValue,
        user: user.id,
        vendedorId: user.id,
        vendedor: user.name,
      };
      setOrderSaveData(saveData);
    }
  }, [
    emitenteCnpj,
    emitenteId,
    businessData,
    deliverDate,
    paymentTerms,
    freightType,
    freightCost,
    aditionalDiscount,
    aditionalCosts,
    itemsList,
    clientOrderNumber,
    orderObservations,
    orderTotalValue,
    user,
    companyData,
  ]);

  const handleSaveOrder = useCallback(async () => {
    if (!emitenteCnpj) {
      return toast({
        title: "Oooopss...",
        description:
          "Você se esqueceu de selecionar o Emitente. É obrigatório.",
        status: "warning",
        duration: 4000,
        isClosable: true,
      });
    }

    if (!itemsList?.length) {
      return toast({
        title: "Oooopss...",
        description: "Você precisa incluir pelo menos um item na proposta.",
        status: "warning",
        duration: 4000,
        isClosable: true,
      });
    }

    setLoading(true);

    fetch(`/api/strapi/businesses/${businessId}`, {
      method: "PUT",
      body: JSON.stringify({ data: { Budget: orderTotalValue } }),
    });

    const method = !orderData ? "POST" : "PUT";
    const strapiEndPoint = !orderData
      ? "/api/strapi/pedidos"
      : `/api/strapi/pedidos/${orderData.id}`;

    const response = await fetch(strapiEndPoint, {
      method,
      body: JSON.stringify({
        data: orderSaveData,
      }),
    });
    const save = await response.json();

    if (!save.data?.id) {
      setLoading(false);
      return toast({
        title: "Oooopss...",
        description: "Algo não deu certo. Não foi possível salvar a proposta.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Tudo certo!",
        description: "A proposta foi salva.",
        status: "success",
        duration: 6000,
        isClosable: true,
      });
      // Keep localStorage so user can edit/delete items when returning to the proposal
      localStorage.setItem(
        ITEMS_STORAGE_KEY(effectiveBusinessId),
        JSON.stringify(itemsList),
      );
      router.push("/negocios");
      setLoading(false);
    }
  }, [orderSaveData, router, itemsList, effectiveBusinessId]);

  return (
    <Flex minH="100vh" w="100%" bg={"gray.800"} color={"white"}>
      <Flex
        w="100%"
        flexDir={"column"}
        px={"5"}
        pb={10}
      >
        <Box
          position="sticky"
          top={0}
          zIndex={10}
          bg={"gray.800"}
          py={3}
          pr={{ base: "100px", md: "120px" }}
          borderBottom="1px solid"
          borderColor="gray.700"
        >
          <Heading size="lg" fontWeight="bold" noOfLines={1}>
            {formatCompanyDisplayName( companyData?.attributes?.nome ) || "Carregando..."}
          </Heading>
        </Box>
        <Box
          position="fixed"
          top={{ base: "76px", md: "16px" }}
          right="24px"
          zIndex={Z_INDEX.MOBILE_NAVBAR_LAYER - 1}
        >
          <Button
            colorScheme="whatsapp"
            onClick={handleSaveOrder}
            isDisabled={loading}
          >
            Salvar
          </Button>
        </Box>
        <Box w="100%">
          <Flex gap={4} flexDir={{ base: "column", lg: "row" }} alignItems="stretch" pt={4}>
            {/* Bloco de Informações - Coluna Esquerda */}
            <Box
              flex="1"
              display="grid"
              gridTemplateColumns={{ base: "1fr", md: "repeat(2, 1fr)", xl: "repeat(3, 1fr)" }}
              gap={6}
              bg="gray.700"
              rounded="md"
              p={5}
              textAlign="center"
            >
              <Box>
                <EmitenteSelect
                  accountsData={accountsData}
                  emitenteCnpj={emitenteCnpj}
                  setEmitenteCnpjOnChange={setEmitenteCnpj}
                />
              </Box>
              <Box>
                <DeliverDate
                  deliverDate={deliverDate}
                  setDeliverDateOnChange={setDeliverDate}
                />
              </Box>
              <Box>
                <PaymentTerms
                  maxPrazoPagto={companyData?.attributes?.maxPg ?? ""}
                  paymentTerms={paymentTerms}
                  setPaymentTermsOnChange={setPaymentTerms}
                />
              </Box>
              <Box>
                <FreightSelect
                  freightType={freightType}
                  setFreightTypeOnChange={setFreightType}
                />
              </Box>
              <Box>
                <FreightCost
                  setFreightCostOnChange={setFreightCost}
                  freightCost={parseCurrency(freightCost)}
                />
              </Box>

              {user && user.pemission === "Adm" && (
                <>
                  <Box>
                    <AditionalDiscount
                      setAditionalDiscountOnChange={
                        handleManualDiscountChangeHeader
                      }
                      aditionalDiscount={manualDiscount}
                    />
                  </Box>
                  <Box>
                    <AditionalCosts
                      setAditionalCostsOnChange={setAditionalCosts}
                      aditionalCosts={aditionalCosts}
                    />
                  </Box>
                </>
              )}
              <Box textAlign="center">
                <FormLabel fontSize="xs" fontWeight="md" textAlign="center" w="full">
                  Pedido do Cliente N°:
                </FormLabel>
                <Input
                  shadow="sm"
                  type={"text"}
                  size="xs"
                  py={1}
                  w="full"
                  textAlign="center"
                  fontSize="xs"
                  rounded="md"
                  onChange={(e) => setClientOrderNumber(e.target.value)}
                  value={clientOrderNumber}
                />
              </Box>
            </Box>

            {/* Bloco de Observação - Coluna Direita */}
            <Box
              w={{ base: "100%", lg: "300px", xl: "400px" }}
              bg="gray.700"
              rounded="md"
              p={5}
              display="flex"
              flexDir="column"
            >
              <FormLabel fontSize="xs" fontWeight="md">
                Observação
              </FormLabel>
              <Textarea
                flex="1"
                minH="100px"
                onChange={(e) => setOrderObservations(e.target.value)}
                placeholder="Breve descrição sobre o andamento"
                size="xs"
                rounded="md"
                value={orderObservations}
                bg="gray.800"
                border="none"
                _focus={{ ring: 1, ringColor: "blue.500" }}
              />
            </Box>
          </Flex>
          <Flex mt={8} justifyContent="space-between" alignItems="center" mb={1}>
            <Heading size="md">Itens da proposta comercial</Heading>
            {companyData?.id && (
              <Button
                colorScheme="green"
                size="sm"
                leftIcon={<FaShoppingCart />}
                onClick={() => {
                  setManualDiscount(0);
                  setDynamicDiscount(0);
                  setResetAllDynamicDiscounts(true);
                  localStorage.removeItem(
                    DISCOUNTS_STORAGE_KEY(effectiveBusinessId),
                  );
                  localStorage.setItem(
                    ITEMS_STORAGE_KEY(effectiveBusinessId),
                    JSON.stringify(itemsList),
                  );
                  localStorage.setItem(
                    FORM_STORAGE_KEY(effectiveBusinessId),
                    JSON.stringify({
                      emitenteCnpj,
                      deliverDate,
                      paymentTerms,
                      freightType,
                      freightCost,
                      manualDiscount: 0,
                      aditionalCosts,
                      clientOrderNumber,
                      orderObservations,
                    }),
                  );
                  router.push(
                    `/produtos?empresaId=${companyData.id}&proposta=${effectiveBusinessId}`,
                  );
                }}
              >
                Incluir Itens
              </Button>
            )}
          </Flex>
          <Box w={"100%"} mb={10} bg={"gray.800"}>
            <Box>
              <TableItems
                itemsList={itemsList}
                setItemsListOnChange={setItemsList}
                companyTablecalc={companyData?.attributes?.tablecalc}
              />
            </Box>
          </Box>
          {companyData && (
            <DynamicDiscounts
              businessId={effectiveBusinessId}
              companyTablecalc={companyData.attributes?.tablecalc}
              deliverDate={deliverDate}
              paymentTerms={paymentTerms}
              freightType={freightType}
              itemsList={itemsList}
              subtotal={subtotal}
              purchaseFrequency={companyData.attributes?.purchaseFrequency}
              onDiscountChange={handleDynamicDiscountChange}
              onManualDiscountChange={handleDynamicManualChange}
              forceResetAll={resetAllDynamicDiscounts}
            />
          )}
        </Box>
        <Box
          display="flex"
          flexDir={{ base: "column", lg: "row" }}
          justifyContent={{ base: "flex-start", lg: "space-between" }}
          alignItems={{ base: "stretch", lg: "center" }}
          gap={{ base: 3, lg: 0 }}
          pt={{ base: 3, md: 2 }}
          px={{ base: 3, md: 2 }}
          bg={"gray.700"}
          rounded="md"
          mt={10}
        >
          <Flex
            flexWrap="wrap"
            gap={{ base: 4, md: 8, lg: 20 }}
            alignItems="center"
            justifyContent="center"
            w="100%"
            py={4}
          >
            <chakra.p fontSize={{ base: "xs", md: "sm" }}>
              Subtotal:
              <br />
              R$ {formatCurrency(subtotal)}
            </chakra.p>
            <chakra.p fontSize={{ base: "xs", md: "sm" }}>
              Frete:
              <br />
              R$ {formatCurrency(freightCost)}
            </chakra.p>
            <chakra.p fontSize={{ base: "xs", md: "sm" }}>
              Descontos:
              <br />
              R$ {formatCurrency(aditionalDiscount)}
            </chakra.p>
            <chakra.p fontSize={{ base: "xs", md: "sm" }}>
              Custos extras:
              <br />
              R$ {formatCurrency(aditionalCosts)}
            </chakra.p>
            <chakra.p
              fontSize={{ base: "sm", md: "md" }}
              fontWeight="bold"
              color="white"
              bg="green.600"
              p={5}
              rounded="md"
            >
              Valor Total:
              <br />
              R$ {orderTotalValue}
            </chakra.p>
          </Flex>
        </Box>
      </Flex>
    </Flex>
  );
};
export default Proposta;
