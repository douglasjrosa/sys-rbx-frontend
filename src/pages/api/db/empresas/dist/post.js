"use strict"
var __awaiter = ( this && this.__awaiter ) || function ( thisArg, _arguments, P, generator )
{
	function adopt ( value ) { return value instanceof P ? value : new P( function ( resolve ) { resolve( value ) } ) }
	return new ( P || ( P = Promise ) )( function ( resolve, reject )
	{
		function fulfilled ( value ) { try { step( generator.next( value ) ) } catch ( e ) { reject( e ) } }
		function rejected ( value ) { try { step( generator[ "throw" ]( value ) ) } catch ( e ) { reject( e ) } }
		function step ( result ) { result.done ? resolve( result.value ) : adopt( result.value ).then( fulfilled, rejected ) }
		step( ( generator = generator.apply( thisArg, _arguments || [] ) ).next() )
	} )
}
var __generator = ( this && this.__generator ) || function ( thisArg, body )
{
	var _ = { label: 0, sent: function () { if ( t[ 0 ] & 1 ) throw t[ 1 ]; return t[ 1 ] }, trys: [], ops: [] }, f, y, t, g
	return g = { next: verb( 0 ), "throw": verb( 1 ), "return": verb( 2 ) }, typeof Symbol === "function" && ( g[ Symbol.iterator ] = function () { return this } ), g
	function verb ( n ) { return function ( v ) { return step( [ n, v ] ) } }
	function step ( op )
	{
		if ( f ) throw new TypeError( "Generator is already executing." )
		while ( _ ) try
			{
				if ( f = 1, y && ( t = op[ 0 ] & 2 ? y[ "return" ] : op[ 0 ] ? y[ "throw" ] || ( ( t = y[ "return" ] ) && t.call( y ), 0 ) : y.next ) && !( t = t.call( y, op[ 1 ] ) ).done ) return t
				if ( y = 0, t ) op = [ op[ 0 ] & 2, t.value ]
				switch ( op[ 0 ] )
				{
					case 0: case 1: t = op; break
					case 4: _.label++; return { value: op[ 1 ], done: false }
					case 5: _.label++; y = op[ 1 ]; op = [ 0 ]; continue
					case 7: op = _.ops.pop(); _.trys.pop(); continue
					default:
						if ( !( t = _.trys, t = t.length > 0 && t[ t.length - 1 ] ) && ( op[ 0 ] === 6 || op[ 0 ] === 2 ) ) { _ = 0; continue }
						if ( op[ 0 ] === 3 && ( !t || ( op[ 1 ] > t[ 0 ] && op[ 1 ] < t[ 3 ] ) ) ) { _.label = op[ 1 ]; break }
						if ( op[ 0 ] === 6 && _.label < t[ 1 ] ) { _.label = t[ 1 ]; t = op; break }
						if ( t && _.label < t[ 2 ] ) { _.label = t[ 2 ]; _.ops.push( op ); break }
						if ( t[ 2 ] ) _.ops.pop()
						_.trys.pop(); continue
				}
				op = body.call( thisArg, _ )
			} catch ( e ) { op = [ 6, e ]; y = 0 } finally { f = t = 0 }
		if ( op[ 0 ] & 5 ) throw op[ 1 ]; return { value: op[ 0 ] ? op[ 1 ] : void 0, done: true }
	}
}
exports.__esModule = true
/* eslint-disable no-undef */
var axios_1 = require( "axios" )
function PostEmpresa ( req, res )
{
	return __awaiter( this, void 0, void 0, function ()
	{
		var data, token, bodyData, DataRbx
		return __generator( this, function ( _a )
		{
			switch ( _a.label )
			{
				case 0:
					if ( !( req.method === 'POST' ) ) return [ 3 /*break*/, 3 ]
					data = req.body
					token = process.env.ATORIZZATION_TOKEN
					bodyData = data.data
					return [ 4 /*yield*/, axios_1[ "default" ]( {
						method: 'POST',
						url: process.env.NEXT_PUBLIC_STRAPI_API_URL + '/empresas',
						data: data,
						headers: {
							Authorization: "Bearer " + token,
							'Content-Type': 'application/json'
						}
					} )
						.then( function ( Response )
						{
							res.status( 200 ).json( Response.data )
						} )[ "catch" ]( function ( err )
						{
							res.status( 400 ).json( {
								error: err.response.data,
								mensage: err.response.data.error,
								detalhe: err.response.data.error.details
							} )
						} ) ]
				case 1:
					_a.sent()
					DataRbx = {
						nome: bodyData.nome,
						email: bodyData.email,
						xNome: bodyData.fantasia,
						CNPJ: bodyData.CNPJ,
						IE: bodyData.Ie,
						IM: '',
						fone: bodyData.cidade,
						indIEDest: '',
						CNAE: bodyData.CNAE,
						xLgr: bodyData.endereco,
						nro: bodyData.numero,
						xCpl: bodyData.complemento,
						cMun: '',
						cPais: bodyData.codpais,
						xPais: bodyData.pais,
						xBairro: bodyData.bairro,
						CEP: bodyData.cep,
						xMun: bodyData.cidade,
						UF: bodyData.uf,
						ativo: bodyData.status !== true ? '' : '1',
						tabela: bodyData.tablecalc,
						ultima_compra: '',
						LatAdFrSN: bodyData.adFrailLat === true ? 'on' : 'off',
						CabAdFrSN: bodyData.adFrailCab === true ? 'on' : 'off',
						LatAdExSN: bodyData.adEspecialLat === true ? 'on' : 'off',
						CabAdExSN: bodyData.adEspecialCab === true ? 'on' : 'off',
						LatForaSN: bodyData.latFCab === true ? 'on' : 'off',
						CabChaoSN: bodyData.cabChao === true ? 'on' : 'off',
						CabTopoSN: bodyData.cabTop === true ? 'on' : 'off',
						caixa_economica: bodyData.cxEco === true ? 'on' : 'off',
						caixa_estruturada: bodyData.cxEst === true ? 'on' : 'off',
						caixa_leve: bodyData.cxLev === true ? 'on' : 'off',
						caixa_reforcada: bodyData.cxRef === true ? 'on' : 'off',
						caixa_resistente: bodyData.cxResi === true ? 'on' : 'off',
						caixa_super_reforcada: bodyData.cxSupRef === true ? 'on' : 'off',
						engradado_economico: bodyData.engEco === true ? 'on' : 'off',
						engradado_leve: bodyData.engLev === true ? 'on' : 'off',
						engradado_reforcado: bodyData.engRef === true ? 'on' : 'off',
						engradado_resistente: bodyData.engResi === true ? 'on' : 'off',
						palete_sob_medida: bodyData.platSMed === true ? 'on' : 'off',
						formaPagto: bodyData.forpg,
						prefPagto: bodyData.maxPg,
						frete: bodyData.frete === '' ? 'fob' : bodyData.frete
					}
					return [ 4 /*yield*/, axios_1[ "default" ]( {
						method: 'post',
						url: process.env.RIBERMAX_API_URL + '/empresas',
						headers: {
							Email: process.env.ATORIZZATION_EMAIL,
							Token: process.env.ATORIZZATION_TOKEN_RIBERMAX,
							'Content-Type': 'application/x-www-form-urlencoded'
						},
						data: new URLSearchParams( DataRbx ).toString()
					} )
						.then( function ( response )
						{
						} )[ "catch" ]( function ( error )
						{
							console.error( error )
						} ) ]
				case 2:
					_a.sent()
					return [ 3 /*break*/, 4 ]
				case 3: return [ 2 /*return*/, res.status( 405 ).send( { message: 'Only POST requests are allowed' } ) ]
				case 4: return [ 2 /*return*/ ]
			}
		} )
	} )
}
exports[ "default" ] = PostEmpresa
