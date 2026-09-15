import { Outlet } from 'react-router-dom'
import PublicHeader from '../components/PublicHeader'
import Footer from '../components/Footer'

export default function PublicLayout() {
  return <><PublicHeader/><main><Outlet/></main><Footer/></>
}
