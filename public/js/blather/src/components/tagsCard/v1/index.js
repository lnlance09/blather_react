import './style.css';
import { updateFallacy } from '../../../pages/actions/fallacy';
import { updateDiscussion } from '../../../pages/actions/discussion';
import { connect, Provider } from 'react-redux';
import { 
    Button,
    Card,
    Dropdown,
    Icon,
    List,
    Modal
} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import store from '../../../store';

class TagsCard extends Component {
    constructor(props) {
        super(props)
        this.state = {
            editing: false,
            open: false,
            options: [],
            tags: props.tags
        }

        this.closeModal = this.closeModal.bind(this)
        this.handleAddition = this.handleAddition.bind(this)
        this.updateTags = this.updateTags.bind(this)
    }

    closeModal = () => this.setState({ open: false })

    componentDidMount() {
        this.fetchTags()
    }

    deleteTags() {
        
    }

    fetchTags() {
        return fetch(`${window.location.origin}/api/discussions/getTags`, {
            headers:{
                'Content-Type': 'application/json'
            }
        }).then(response => {
            if(response.ok) {
                response.json().then(data => {
                    this.setState({ options: data.tags })
                })
            }
        }).catch(err => console.log(err))
    }

    handleAddition = (e, { value }) => this.setState({ options: [{ text: value, value }, ...this.state.options] })

    handleChange = (e, { value }) => this.setState({ tags: value })

    updateTags = () => {
        this.setState({ editing: false, open: false })
        if(this.props.type === 'fallacy') {
            this.props.updateFallacy({ 
                bearer: this.props.bearer,
                tags: this.state.tags
            })
        }

        if(this.props.type === 'discussion') {
            this.props.updateDiscussion({ 
                bearer: this.props.bearer,
                id: this.props.id,
                tags: this.state.tags
            })
        }
    }

    render() {
        const { open, options, tags } = this.state
        const TagsModal = (
             <Modal 
                centered={false}
                onClose={this.closeModal} 
                open={open} 
                size='small'
            >
                <Modal.Header>Add tags</Modal.Header>
                <Modal.Content>
                    <Modal.Description>
                        <Dropdown
                            allowAdditions
                            closeOnChange
                            fluid
                            multiple
                            onAddItem={this.handleAddition}
                            onChange={this.handleChange}
                            options={options}
                            placeholder='Tags'
                            search
                            selection
                            value={tags}
                        />
                        <Button
                            className='tagModalBtn'
                            content='Update'
                            onClick={this.updateTags}
                        />
                        <div className='clearfix'></div>
                    </Modal.Description>
                </Modal.Content>
            </Modal>
        )
        const RenderTags = this.props.tags.map(tag => (
            <List.Item>
                {tag.name}
                {this.props.canEdit && (
                    <List.Content floated='right'>
                        <Icon 
                            name='close' 
                            onClick={this.deleteTag}
                        />
                    </List.Content>
                )}
            </List.Item>
        ))
        const ShowTags = props => {
            if(props.tags.length > 0) {
                return (
                    <List className='tagsList' divided relaxed>
                        {RenderTags}
                    </List>
                )
            }
            return (
                <div>
                    No tags have been added
                </div>
            )
        }

        return (
            <Provider store={store}>
                <div>
                    <Card className='tagsCard'>
                        <Card.Content>
                            <Card.Header>
                                Tags
                                {this.props.canEdit && (
                                    <Icon 
                                        className='editTagsIcon' 
                                        name='pencil' 
                                        onClick={() => this.setState({ open: true })}
                                    />
                                )}
                            </Card.Header>
                            <Card.Description>
                                <div>
                                    {ShowTags(this.props)}
                                </div>
                            </Card.Description>
                        </Card.Content>
                    </Card>
                    <div>
                        {TagsModal}
                    </div>
                </div>
            </Provider>
        )
    }
}

TagsCard.propTypes = {
    bearer: PropTypes.string,
    canEdit: PropTypes.bool,
    id: PropTypes.number,
    tags: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.bool
    ]),
    type: PropTypes.string,
    updateDiscussion: PropTypes.func,
    updateFallacy: PropTypes.func
}

TagsCard.defaultProps = {
    canEdit: false,
    type: 'fallacy',
    updateDiscussion: updateDiscussion,
    updateFallacy: updateFallacy
}

const mapStateToProps = (state, ownProps) => ({
    ...state.discussion,
    ...state.fallacy,
    ...ownProps
})

export default connect(mapStateToProps, { updateDiscussion, updateFallacy })(TagsCard);