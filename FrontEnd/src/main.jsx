import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import {Provider} from 'react-redux';
import {createStore,combineReducers} from 'redux';
import { userReducer } from './services/reducers/reducers.jsx';
import './index.css'

const store = createStore(combineReducers({
  user:userReducer
}));

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <Provider store={store}>
    <App />
  </Provider>
  // </StrictMode>,
)
