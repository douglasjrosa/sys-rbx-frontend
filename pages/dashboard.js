import { fetchAPI } from "utils/api";

const Dashboard = (props) => {
    
    console.log(props);
    if(!props) return <h1>Nada ainda...</h1>
    return <h1>Dashboard</h1>
};

export async function getServerSideProps(){
    
    const resp = await fetchAPI("/pages");
    
    return {
        props: {
            pages: resp
        }
    }
}

export default Dashboard;