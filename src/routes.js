import React from 'react'
import {
    BrowserRouter,
    Route
} from 'react-router-dom'

import Main from './pages/Main';
import Player from './pages/Player';

const Routes = () => {
    return(
    <BrowserRouter>
    <Route path="/" exact component={Main}/>
    <Route path="/watch/:room" component={Player}/>
    </BrowserRouter>
    )
}

export default Routes;