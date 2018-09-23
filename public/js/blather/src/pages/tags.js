import './css/index.css';
import { adjustTimezone } from 'utils/dateFunctions';
import { DisplayMetaTags } from 'utils/metaFunctions';
import { fetchTagInfo, updateTag } from './actions/tag';
import Moment from 'react-moment';
import Dropzone from 'react-dropzone';
import { connect, Provider } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
    Button,
    Container,
    Dimmer,
    Form,
    Grid,
    Header,
    Icon,
    Image,
    Segment,
    TextArea
} from 'semantic-ui-react';
import defaultImg from 'pages/images/trump.svg';
import PageFooter from 'components/footer/v1/';
import PageHeader from 'components/header/v1/';
import ParagraphPic from 'images/short-paragraph.png';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import store from 'store';
import TitleHeader from 'components/titleHeader/v1/';

class Tags extends Component {
    constructor(props) {
        super(props)
        const id = parseInt(this.props.match.params.id,10)
        const currentState = store.getState()
        const authenticated = currentState.user.authenticated
        const bearer = currentState.user.bearer
        const userId = parseInt(currentState.user.data.id,10)
        this.state = {
            active: false,
            authenticated,
            bearer,
            id,
            editing: false,
            inverted: true,
            userId
        }

        this.props.fetchTagInfo({ id })

        this.onChangeDescription = this.onChangeDescription.bind(this)
        this.onClickEdit = this.onClickEdit.bind(this)
        this.updateTag = this.updateTag.bind(this)
    }

    handleHide = () => this.setState({ active: false })
    handleShow = () => this.setState({ active: true })
    onChangeDescription = (e, { value }) => this.setState({ description: value })
    onClickEdit = () => {
        this.setState({ 
            description: this.props.description,
            editing: this.state.editing === false
        })
    }

    updateTag = () => {
        this.props.updateTag({
            id: this.props.id,
            description: this.state.description
        })
    }

    render() {
        const { active, authenticated, bearer, editing, id, inverted, name } = this.state
        const pic = !this.props.img && !this.props.loading ? defaultImg : this.props.img
        const content = (
            <div>
                <Dropzone onDrop={this.onDrop} style={{ width: '100%', height: '100%', border: 'none' }}>
                    <Header as='h2'>
                        Change pic
                    </Header>
                    <Button className='changePicBtn' icon>
                        <Icon name='image' />
                    </Button>
                </Dropzone>
            </div>
        )
        const EditButton = ({props}) => {
            if(!props.loading) {
                if(authenticated) {
                    if(editing) {
                        return (<Icon className='editButton editing' name='close' onClick={this.onClickEdit} />)
                    }
                    return (<Icon className='editButton' name='pencil' onClick={this.onClickEdit} />)
                }
            }
            return null
        }
        const ProfilePic = props => {
            if(authenticated) {
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
        const TagTitle = ({props}) => {
            console.log('t')
            console.log(props)
            const subheader = (
                <div>
                    {props.createdBy && (
                        <div>
                            <Icon name='tag' /> {' '}
                            Created <Moment date={adjustTimezone(props.dateCreated)} fromNow interval={60000} /> {' '}
                            by <Link to={`/users/${props.createdBy.username}`}>{props.createdBy.name}</Link>
                        </div>
                    )}
                </div>
            )
            return (
                <TitleHeader 
                    bearer={bearer}
                    canEdit={false}
                    id={id}
                    subheader={subheader}
                    title={props.name}
                    type='tag'
                />
            )
        }

        return (
            <Provider store={store}>
                <div className='tagsPage'>
                    <DisplayMetaTags page='tags' props={this.props} state={this.state} />
                    <PageHeader
                        {...this.props}
                    />
                    <Container
                        className='mainContainer'
                        textAlign='left'
                    >
                        <Grid>
                            <Grid.Column className='leftSide' width={4}>
                                {ProfilePic(this.props)}
                            </Grid.Column>
                            <Grid.Column width={12}>
                                <TagTitle props={this.props} />
                                {this.props.loading && (
                                    <Segment loading>
                                        <Image fluid src={ParagraphPic} />
                                        <Image fluid src={ParagraphPic} />
                                        <Image fluid src={ParagraphPic} />
                                        <Image fluid src={ParagraphPic} />
                                        <Image fluid src={ParagraphPic} />
                                    </Segment>
                                )}
                                {!this.props.loading && (
                                    <Segment basic>
                                        <div style={{ height: '30px' }}>
                                            <EditButton props={this.props} />
                                        </div>
                                        {editing && (
                                            <Form onSubmit={this.updateTag}>
                                                <Form.Field>
                                                    <TextArea 
                                                        onChange={this.onChangeDescription}
                                                        rows={25} 
                                                    />
                                                </Form.Field>
                                                <Button 
                                                    className='updateBtn'
                                                    compact
                                                    content='Update' 
                                                    fluid 
                                                    type='submit' 
                                                />
                                            </Form>
                                        )}
                                        {!editing && (
                                            <div>
                                                {this.props.description}
                                            </div>
                                        )}
                                    </Segment>
                                )}
                            </Grid.Column>
                        </Grid>
                    </Container>
                    <PageFooter />
                </div>
            </Provider>
        )
    }
}

Tags.propTypes = {
    createdBy: PropTypes.shape({
        id: PropTypes.number,
        img: PropTypes.string,
        name: PropTypes.string,
        username: PropTypes.string
    }),
    dateCreated: PropTypes.string,
    description: PropTypes.sting,
    fetchTagInfo: PropTypes.func,
    id: PropTypes.number,
    img: PropTypes.string,
    loading: PropTypes.bool,
    name: PropTypes.string,
    updateTag: PropTypes.func
}

Tags.defaultProps = {
    fetchTagInfo: fetchTagInfo,
    loading: true,
    updateTag: updateTag
}

const mapStateToProps = (state, ownProps) => {
    return {
        ...state.tag,
        ...ownProps
    }
}

export default connect(mapStateToProps, { 
    fetchTagInfo,
    updateTag
})(Tags)