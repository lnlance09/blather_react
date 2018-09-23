import './css/index.css';
import { changeProfilePic, updateAbout } from '../components/authentication/v1/actions';
import { DisplayMetaTags } from '../utils/metaFunctions';
import { fetchUserData } from './actions/user';
import { Provider, connect } from 'react-redux';
import { 
    Button,
    Container,
    Dimmer,
    Grid,
    Header,
    Icon,
    Image,
    Label,
    Menu,
    Transition
} from 'semantic-ui-react'; 
import AboutCard from '../components/aboutCard/v1/';
import defaultImg from './images/trump.svg';
import ArchivesList from '../components/archivesList/v1/';
import DiscussionsList from '../components/discussionsList/v1/';
import Dropzone from 'react-dropzone';
import FallaciesList from '../components/fallaciesList/v1/';
import PageFooter from '../components/footer/v1/';
import PageHeader from '../components/header/v1/';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import store from '../store';
import TitleHeader from '../components/titleHeader/v1/';

class UserPage extends Component {
    constructor(props) {
        super(props)
        const tabs = ['discussions', 'fallacies', 'archives']
        const currentState = store.getState()
        const user = currentState.user
        const authenticated = user.authenticated
        const bearer = user.bearer
        const username = this.props.match.params.username
        let tab = this.props.match.params.tab
        if(!tabs.includes(tab)) {
            tab = 'discussions'
        }

        let isMyProfile = false
        if(username === user.data.username) {
            isMyProfile = true
        }

        this.props.fetchUserData({
            username,
            bearer: user.bearer
        })

        this.state = {
            about: user.data.bio ? user.data.bio : '',
            active: false,
            activeItem: tab ? tab : 'discussions',
            animation: 'zoom',
            authenticated,
            bearer,
            duration: 500,
            editing: false,
            files: [],
            inverted: true,
            isMyProfile,
            visible: false,
            username
        }

        this.onDrop = this.onDrop.bind(this)
        this.onChangeAbout = this.onChangeAbout.bind(this)
    }

    onChangeAbout = (e, { value }) => this.setState({ about: value })

    componentDidMount() {
        this.setState({ visible: true })
    }

    handleItemClick = (e, { name }) => {
        this.setState({ activeItem: name })
        this.props.history.push(`/users/${this.state.username}/${name}`)
    }

    handleHide = () => this.setState({ active: false })
    handleShow = () => this.setState({ active: true })

    onDrop(files) {
        this.setState({ files })
        if(files.length > 0) {
            this.props.changeProfilePic({
                bearer: this.state.bearer,
                file: files[0]
            })
        }
    }

    updateAbout = () => {
        this.setState({ editing: false })
        this.props.updateAbout({ 
            bearer: this.state.bearer,
            bio: this.state.about
        })
    }

    render() {
        const { about, active, activeItem, animation, bearer, duration, inverted, isMyProfile, visible } = this.state
        let pic = !this.props.user.img && !this.props.loading ? defaultImg : this.props.user.img
        if(isMyProfile) {
            pic = !this.props.data.img && !this.props.loading ? defaultImg : this.props.data.img
        }
        const aboutCard = props => (
            <AboutCard 
                bearer={bearer}
                canEdit={isMyProfile}
                description={about}
                title='About'
                type='user'
            />
        )
        const content = (
            <div>
                <Dropzone onDrop={this.onDrop} style={{ width: '100%', height: '100%', border: 'none' }}>
                    <Header as='h2'>
                        Change your pic
                    </Header>
                    <Button className='changePicBtn' icon>
                        <Icon name='image' />
                    </Button>
                </Dropzone>
            </div>
        )
        const profilePic = props => {
            if(isMyProfile) {
                return (
                    <Dimmer.Dimmable
                        as={Image}
                        dimmed={active}
                        dimmer={{ active, content, inverted }}
                        onMouseEnter={this.handleShow}
                        onMouseLeave={this.handleHide}
                        size='medium'
                        src={pic}
                    />
                )
            }
            return (<Image src={pic} style={{ border: 'none' }} />)
        }
        const ShowContent = props => {
            if(props.user.id) {
                switch(activeItem) {
                    case'discussions':
                        return (
                            <DiscussionsList
                                filter={{
                                    startedBy: props.user.id
                                }}
                                onUserPage
                                userImages={false}
                                {...props}
                            />
                        )
                    case'fallacies':
                        return (
                            <FallaciesList 
                                assignedBy={props.user.id}
                                history={props.history}
                                source='users'
                            />
                        )
                    case'archives':
                        return (
                            <ArchivesList 
                                id={props.user.id}
                            />
                        )
                    default:
                        return null
                }
            }
        }

        return (
            <Provider store={store}>
                <div className='usersPage'>
                    <DisplayMetaTags page='users' props={this.props} state={this.state} />
                    <PageHeader 
                        {...this.props}
                    />
                    <Container
                        className='mainContainer'
                        textAlign='left'
                    >
                        <Grid>
                            <Grid.Column width={4}>
                                <Transition animation={animation} duration={duration} visible={visible}>
                                    {profilePic(this.props)}
                                </Transition>
                                {aboutCard(this.props)}
                            </Grid.Column>
                            <Grid.Column width={12}>
                                <TitleHeader
                                    subheader={`@${this.props.user.username}`}
                                    title={this.props.user.name}
                                />
                                <Menu
                                    className='profileMenu' 
                                    pointing
                                    secondary
                                >
                                    <Menu.Item 
                                        active={activeItem === 'discussions'} 
                                        name='discussions'
                                        onClick={this.handleItemClick} 
                                    >
                                        Discussions {' '}
                                        {this.props.user.discussionCount > 0 && (
                                            <Label circular>{this.props.user.discussionCount}</Label>
                                        )}
                                    </Menu.Item>
                                    <Menu.Item 
                                        active={activeItem === 'fallacies'} 
                                        name='fallacies' 
                                        onClick={this.handleItemClick} 
                                    >
                                        Fallacies {' '}
                                        {this.props.user.fallacyCount > 0 && (
                                            <Label circular>{this.props.user.fallacyCount}</Label>
                                        )}
                                    </Menu.Item>
                                    <Menu.Item 
                                        active={activeItem === 'archives'} 
                                        name='archives' 
                                        onClick={this.handleItemClick} 
                                    >
                                        Archives {' '}
                                        {this.props.user.archiveCount > 0 && (
                                            <Label circular>{this.props.user.archiveCount}</Label>
                                        )}
                                    </Menu.Item>
                                </Menu>
                                <Container className='profileContentContainer'>
                                    {ShowContent(this.props)}
                                </Container>
                            </Grid.Column>
                        </Grid>
                    </Container>
                    <PageFooter />
                </div>
            </Provider>
        )
    }
}

UserPage.propTypes = {
    changeProfilePic: PropTypes.func,
    fetchUserData: PropTypes.func,
    loading: PropTypes.bool,
    user: PropTypes.shape({
        archiveCount: PropTypes.number,
        bio: PropTypes.string,
        discussionCount: PropTypes.number,
        emailVerified: PropTypes.bool,
        fallacyCount: PropTypes.number,
        fbId: PropTypes.string,
        id: PropTypes.number,
        img: PropTypes.string,
        linkedFb: PropTypes.bool,
        linkedTwitter: PropTypes.bool,
        linkedYoutube: PropTypes.bool,
        name: PropTypes.string,
        twitterUsername: PropTypes.string,
        username: PropTypes.string,
        youtubeId: PropTypes.string
    })
}

UserPage.defaultProps = {
    changeProfilePic: changeProfilePic,
    fetchUserData: fetchUserData,
    loading: true,
    user: {}
}

const mapStateToProps = (state, ownProps) => {
    return {
        ...state.pageUser,
        ...state.user,
        ...ownProps
    }
}

export default connect(mapStateToProps, {
    fetchUserData, 
    changeProfilePic, 
    updateAbout 
})(UserPage)