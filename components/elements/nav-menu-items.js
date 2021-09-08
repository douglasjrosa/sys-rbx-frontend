import { RiDashboardFill } from "react-icons/ri";
import { BsPeopleFill } from "react-icons/bs";
import { FaMoneyBillAlt, FaTasks } from "react-icons/fa";
import { GiCube } from "react-icons/gi";
import { MdBusiness } from "react-icons/md";

const NavMenuItems = [
    {
    id: "1",
    url: "/",
    text: "Painel",
    icon: RiDashboardFill,
    iconComponent: <RiDashboardFill />
    },
    {
    id: "2",
    url: "/negocios",
    text: "Negócios",
    icon: FaMoneyBillAlt,
    iconComponent: <FaMoneyBillAlt />
    },
    {
    id: "3",
    url: "/tarefas",
    text: "Tarefas",
    icon: FaTasks,
    iconComponent: <FaTasks />
    },
    {
    id: "4",
    url: "/empresas",
    text: "Empresas",
    icon: MdBusiness,
    iconComponent: <MdBusiness />
    },
    {
    id: "5",
    url: "/pessoas",
    text: "Pessoas",
    icon: BsPeopleFill,
    iconComponent: <BsPeopleFill />
    },
    {
    id: "6",
    url: "/produtos",
    text: "Produtos",
    icon: GiCube,
    iconComponent: <GiCube />
    }
];

export default NavMenuItems;