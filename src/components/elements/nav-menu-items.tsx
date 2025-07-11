import { BsPeopleFill } from 'react-icons/bs';
import { FaMoneyBillAlt, FaQuoteLeft } from 'react-icons/fa';
import { GiCube } from 'react-icons/gi';
import { MdBusiness } from 'react-icons/md';
import { RiDashboardFill } from 'react-icons/ri';

const NavMenuItems = [
  {
    id: '1',
    url: '/',
    text: 'Painel',
    icon: RiDashboardFill,
    iconComponent: <RiDashboardFill />,
    permission: 'User',
  },
  {
    id: '2',
    url: '/negocios',
    text: 'Negócios',
    icon: FaMoneyBillAlt,
    iconComponent: <FaMoneyBillAlt />,
    permission: 'User',
  },
  {
    id: '3',
    url: '/empresas',
    text: 'Empresas',
    icon: MdBusiness,
    iconComponent: <MdBusiness />,
    permission: 'User',
	},
	{
		id: '4',
		url: '/quotes',
		text: 'Cotações',
		icon: FaQuoteLeft,
		iconComponent: <FaQuoteLeft />,
		permission: 'User',
	},
	{
		id: '5',
		url: 'https://ribermax.com?page=login',
		text: 'Produtos',
		icon: GiCube,
		iconComponent: <GiCube />,
		permission: 'User',
	},
  {
    id: '6',
    url: '/vendedor',
    text: 'Vendedores',
    icon: BsPeopleFill,
    iconComponent: <BsPeopleFill />,
    permission: 'Adm',
  },
];

export default NavMenuItems;
