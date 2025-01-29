import { Box, Heading, Link, } from "@chakra-ui/react"

const linkRenato = "https://www.bling.com.br/Api/v3/oauth/authorize?response_type=code&client_id=3b20ab6c097ade43a1de570f3c846e1beac1eaf8&state=11cf6c1c1dd83b24997a26a44ce78e28"
const linkMax = "https://www.bling.com.br/Api/v3/oauth/authorize?response_type=code&client_id=050b7facd85b3eab7df48c932fa41c3cf6033eb9&state=a2725db1edbd2a8248cebfc0493fe970"
const linkBragheto = "https://www.bling.com.br/Api/v3/oauth/authorize?response_type=code&client_id=fbd0d31cb62a786228f146f5b3a1c38bffb3ac1e&state=1d167719311bdbd3918307be4abe4bcc"



export default function Bling () {


	return (
		<Box m={ 100 } p={ 20 } bg={ 'gray.700' } rounded="xl">
			<Heading mb={ 10 }>Autenticação - Bling API</Heading>
			<Link
				bg={ "#358600" }
				p={ 3 }
				rounded={ 8 }
				mr={ 6 }
				href={ linkMax }
			>
				Max Brasil
			</Link>
			<Link
				bg={ "#008cff" }
				p={ 3 }
				mr={ 6 }
				rounded={ 8 }
				href={ linkRenato }
			>
				Renago Hugo
			</Link>
			<Link
				bg={ "#ffbb00" }
				color="black"
				p={ 3 }
				rounded={ 8 }
				href={ linkBragheto }
			>
				Bragheto
			</Link>
		</Box>
	)
}