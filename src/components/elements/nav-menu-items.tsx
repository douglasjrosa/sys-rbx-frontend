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
    url: '/tarefas',
    text: 'Tarefas',
    icon: FaTasks,
    iconComponent: <FaTasks />,
    permission: 'Adm',
  },
  {
    id: '4',
    url: '/Propostas/adm',
    text: 'Propostas',
    icon: AiOutlineCodepen,
    iconComponent: <AiOutlineCodepen />,
    permission: 'Adm',
  },
  {
    id: '5',
    url: '/empresas',
    text: 'Empresas',
    icon: MdBusiness,
    iconComponent: <MdBusiness />,
    permission: 'User',
  },
  {
    id: '6',
    url: '/pessoas/ativate',
    text: 'Pessoas',
    icon: BsPeopleFill,
    iconComponent: <BsPeopleFill />,
    permission: 'Adm',
  },
  {
    id: '7',
    url: '/produtos',
    text: 'Produtos',
    icon: GiCube,
    iconComponent: <GiCube />,
    permission: 'User',
  },
];

export default NavMenuItems;
