import './css/App.css';
import 'semantic-ui-css/semantic.min.css';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import About from './pages/about';
import CreateDiscussion from './pages/createDiscussion';
import Discussion from './pages/discussion';
import Discussions from './pages/discussions';
import Fallacy from './pages/fallacy';
import Fallacies from './pages/fallacies';
import Page from './pages/';
import Post from './pages/post';
import React from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';
import SearchPage from './pages/search';
import Settings from './pages/settings';
import SignIn from './pages/signIn';
import store from './store';
import Tags from './pages/tags';
import Users from './pages/users';

ReactDOM.render(
<Provider store={store}>
    <BrowserRouter>
        <div>
            <Route path='/' exact component={Fallacies} />

            <Switch>
                <Route path='/about' exact render={(props) => (<About key={window.location.pathname} {...props} />)}/>
                <Route path='/about/:tab(contact|privacy)' render={(props) => (<About key={window.location.pathname} {...props} />)} />
            </Switch>

            <Switch>
                <Route path='/discussion/create' exact component={CreateDiscussion} />
                <Route path='/discussions' exact component={Discussions} />
                <Route path='/discussions/:id' component={Discussion} />
            </Switch>

            <Switch>
                <Route path='/fallacies' exact component={Fallacies} />
                <Route 
                    path='/fallacies/:id' 
                    exact 
                    render={(props) => {
                        const id = props.match.params.id 
                        if(Number.isInteger(parseInt(id,10))) {
                            return (<Fallacy {...props} />)
                        }
                        return (<Fallacies {...props} />)
                    }} 
                />
            </Switch>

            <Switch>
                <Route path='/pages/:network/:id' exact render={() => (<Page key={window.location.pathname}/>)} />
                <Route path='/pages/:network/:id/:tab' render={() => (<Page key={window.location.pathname}/>)} />
            </Switch>

            <Switch>
                <Route path='/search' exact component={SearchPage} />
                <Route path='/search/:type' component={SearchPage} />
            </Switch>

            <Switch>
                <Route path='/settings' exact component={Settings} />
                <Route path='/settings/:tab' component={Settings} />
            </Switch>

            <Route path='/signin' component={SignIn} />

            <Switch>
                <Route path='/tweet/:id' component={Post} />
            </Switch>

            <Switch>
                <Route path='/tag/create' component={Tags} />
                <Route path='/tags/:name' component={Tags} />
            </Switch>

            <Switch>
                <Route path='/users/:username' exact component={Users} />
                <Route path='/users/:username/:tab' component={Users} />
            </Switch>

            <Switch>
                <Route path='/video/:id' exact component={Post} />
                <Route path='/video/:id/:commentId' component={Post} />
            </Switch>
        </div>
    </BrowserRouter>
</Provider>, document.getElementById('root'));
registerServiceWorker();