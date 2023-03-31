"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.CardList = void 0;
var react_1 = require("@chakra-ui/react");
var axios_1 = require("axios");
var router_1 = require("next/router");
var react_2 = require("react");
exports.CardList = function (props) {
    var router = router_1.useRouter();
    var url = '/api/db/proposta/get/business/' + props.id;
    var _a = react_2.useState([]), Data = _a[0], setData = _a[1];
    react_2.useEffect(function () {
        (function () { return __awaiter(void 0, void 0, void 0, function () {
            var requeste, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, axios_1["default"](url)];
                    case 1:
                        requeste = _a.sent();
                        response = requeste.data;
                        // console.table(response);
                        setData(response);
                        return [2 /*return*/];
                }
            });
        }); })();
    }, [url]);
    return (React.createElement(React.Fragment, null,
        React.createElement(react_1.Flex, { mx: '10rem', w: 'full', h: 'full', border: '1px solid', borderColor: 'gray.400', rounded: '5rem', p: 10 },
            React.createElement(react_1.Flex, { h: 'full', w: 'full', overflowX: 'hidden', justifyContent: "center" },
                React.createElement(react_1.SimpleGrid, { p: "1rem", columns: { base: 1, md: 3 }, row: { base: 1, md: 5 }, spacing: { base: 3, md: 10 } }, !Data
                    ? null
                    : Data.map(function (i, x) {
                        console.log(i);
                        var dat = new Date(i.attributes.dataPedido);
                        var meses = [
                            'Jan',
                            'Fev',
                            'Mar',
                            'Abr',
                            'Mai',
                            'Jun',
                            'Jul',
                            'Ago',
                            'Set',
                            'Out',
                            'Nov',
                            'Dez',
                        ];
                        var DataPedido = dat.getDate() + 1 + " " + meses[dat.getMonth()] + " " + dat.getFullYear();
                        return (React.createElement(React.Fragment, null,
                            React.createElement(react_1.Box, { mx: "auto", rounded: "xl", shadow: "md", bg: "white", w: "sm", h: '20rem', px: 5, py: 4 },
                                React.createElement(react_1.Box, null,
                                    React.createElement(react_1.Flex, { w: 'fill', justifyContent: '' },
                                        React.createElement(react_1.Text, { fontWeight: "bold", color: "gray.700" },
                                            "Pedido N\u00B0:",
                                            ' ',
                                            React.createElement(react_1.chakra.span, { fontSize: "sm", fontWeight: "light", textTransform: "uppercase", color: "brand.600" }, i.attributes.nPedido)),
                                        React.createElement(react_1.Text, { fontWeight: "bold", color: "gray.700" },
                                            "Negocio N\u00B0:",
                                            ' ',
                                            React.createElement(react_1.Link, { fontSize: "sm", fontWeight: "light", textTransform: "uppercase", color: "brand.600", onClick: function () {
                                                    return router.push('/negocios/' +
                                                        i.attributes.business.data.id);
                                                } }, i.attributes.business.data.attributes
                                                .nBusiness))),
                                    React.createElement(react_1.Flex, { h: 20, mt: 5, justifyContent: 'center', alignItems: 'center', flexDir: 'column' },
                                        React.createElement(react_1.Link, { display: "block", color: "gray.800", fontWeight: "bold", fontSize: "xl", mt: 2 }, "Cliente:"),
                                        React.createElement(react_1.Link, { display: "block", color: "gray.800", fontWeight: "bold", fontSize: "xl", textAlign: 'center', mt: 2, _hover: {
                                                color: 'gray.600',
                                                textDecor: 'underline'
                                            }, onClick: function () {
                                                return router.push('/Propostas/update/' + i.attributes.nPedido);
                                            } }, !i.attributes.empresa
                                            ? null
                                            : i.attributes.empresa.data.attributes.nome)),
                                    React.createElement(react_1.Box, { mt: 8 },
                                        React.createElement(react_1.Flex, { alignItems: "center" },
                                            React.createElement(react_1.Flex, { alignItems: "center" },
                                                React.createElement(react_1.Text, { mx: 2, fontWeight: "bold", color: "gray.700", _dark: {
                                                        color: 'gray.200'
                                                    } }, "Pedido gerado em :")),
                                            React.createElement(react_1.chakra.span, { mx: 1, fontSize: "sm", color: "gray.600", _dark: {
                                                    color: 'gray.300'
                                                } }, DataPedido)),
                                        React.createElement(react_1.Flex, { flexd: true, mt: 3 },
                                            React.createElement(react_1.Button, { p: 7, w: 'full', colorScheme: 'whatsapp', onClick: function () {
                                                    return window.open("/api/db/proposta/pdf/" + i.attributes.nPedido, '_blank');
                                                } }, "Gerar PDF"),
                                            React.createElement(react_1.Button, { p: 7, w: 'full', colorScheme: 'whatsapp', onClick: function () {
                                                    return window.open("/api/db/proposta/pdf/" + i.attributes.nPedido, '_blank');
                                                } }, "Gerar Pedido")))))));
                    }))))));
};
