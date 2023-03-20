import { AiOutlineCodepen } from 'react-icons/ai';
import { BsPeopleFill } from 'react-icons/bs';
import { FaMoneyBillAlt, FaTasks } from 'react-icons/fa';
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
  },
  {
    id: '2',
    url: '/negocios',
    text: 'Negócios',
    icon: FaMoneyBillAlt,
    iconComponent: <FaMoneyBillAlt />,
  },
  {
    id: '3',
    url: '/tarefas',
    text: 'Tarefas',
    icon: FaTasks,
    iconComponent: <FaTasks />,
  },
  {
    id: '4',
    url: '/Propostas',
    text: 'Propostas',
    icon: AiOutlineCodepen,
    iconComponent: <AiOutlineCodepen />,
  },
  {
    id: '5',
    url: '/empresas',
    text: 'Empresas',
    icon: MdBusiness,
    iconComponent: <MdBusiness />,
  },
  {
    id: '6',
    url: '/pessoas',
    text: 'Pessoas',
    icon: BsPeopleFill,
    iconComponent: <BsPeopleFill />,
  },
  {
    id: '7',
    url: '/produtos',
    text: 'Produtos',
    icon: GiCube,
    iconComponent: <GiCube />,
  },
  {
    id: '88',
    url: '/api/auth/signout',
    text: 'Signout',
    icon: GiCube,
    iconComponent: <GiCube />,
  },
];

export default NavMenuItems;
