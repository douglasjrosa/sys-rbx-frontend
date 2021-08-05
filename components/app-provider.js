import { Provider, useSession } from "next-auth/client"


const AppProvider = (props) => {
    const [ session, load ] = useSession();
    return (
        <div>
            foi
        </div>
    )
}

export default AppProvider;