import "./style.css"
import { fetchData } from "./actions"
import { connect } from "react-redux"
import { Container, Header, Image } from "semantic-ui-react"
import PropTypes from "prop-types"
import React, { Component } from "react"

class Example extends Component {
	render() {
		return (
			<div className="example">
				<p>Lance</p>
			</div>
		)
	}
}

Example.propTypes = {}

Example.defaultProps = {}

/**
 * @param {object} state
 * @param {object} ownProps
 * @returns {object}
 */
const mapStateToProps = (state, ownProps) => ({
	...state.testWidget,
	...ownProps
})

/**
 * @param {function} dispatch
 * @returns {object}
 */
const mapDispatchToProps = dispatch => ({
	// doSomething: () => dispatch(Actions.doSomething())
})

export default connect(mapStateToProps, { fetchData })(Example)
