import Logout from "./Logout.jsx"
import LoggedUser from "./LoggedUser.jsx"
const Dashboard = () => {
    return (
        <>
        <h1>Dashboard</h1>

        <header>
            <Logout/>
        </header>

        <div className="loggedUser">
            <LoggedUser/>
        </div>
        </>
    )
}

export default Dashboard