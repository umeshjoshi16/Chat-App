import React from "react"
import { Routes, Route } from "react-router-dom";
import { UserProvider } from "./Context/userContext.jsx";
import Dashboard from "./Pages/Dashboard"
import Login from "./Pages/Login"
import Register from "./Pages/Register"
import Home from "./Pages/Home";
import Profile from "./Pages/Profile";



export default function App(){

  return(
    <UserProvider>
    <Routes>
      <Route path="/" element={<Dashboard/>}/>
      <Route path="/login" element={<Login/>}/>
      <Route path="/register" element={<Register/>}/>

      <Route path="/home" element={<Home/>}/>
      <Route path='/profile'  element={<Profile/>}/>
    </Routes>
    </UserProvider>
  )
}