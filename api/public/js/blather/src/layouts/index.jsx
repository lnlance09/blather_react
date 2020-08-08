import { Container, Grid } from "semantic-ui-react"
import PageFooter from "components/primary/footer/v1/"
import PageHeader from "components/secondary/header/v1/"
import PropTypes from "prop-types"
import React, { Fragment, useState } from "react"
import Sidebar from "components/primary/sidebar/v1/"

const DefaultLayout = ({
	activeItem,
	children,
	containerClassName,
	history,
	isText,
	showFooter,
	textAlign,
	useGrid
}) => {
	const [searchMode, setSearchMode] = useState(false)

	return (
		<Fragment>
			{searchMode ? (
				<Container className="searchModeContainer">
					<Grid>
						<Grid.Row>
							<Grid.Column width={13}></Grid.Column>
							<Grid.Column width={3}>
								<span
									className="closeSearchMode"
									onClick={() => setSearchMode(false)}
								>
									Cancel
								</span>
							</Grid.Column>
						</Grid.Row>
					</Grid>
				</Container>
			) : (
				<Fragment>
					<PageHeader history={history} />

					<Container
						// className={`mainContainer ${containerClassName}`}
						text={isText}
						textAlign={textAlign}
					>
						{useGrid ? (
							<Grid className="mainGrid" stackable>
								<Grid.Column className="leftColumn" width={4}>
									<Sidebar activeItem={activeItem} history={history} inverted />
								</Grid.Column>
								<Grid.Column width={12}>{children}</Grid.Column>
							</Grid>
						) : (
							<Fragment>{children}</Fragment>
						)}
					</Container>

					{showFooter && <PageFooter />}
				</Fragment>
			)}
		</Fragment>
	)
}

DefaultLayout.propTypes = {
	activeItem: PropTypes.string,
	children: PropTypes.node,
	containerClassName: PropTypes.string,
	history: PropTypes.object,
	isText: PropTypes.bool,
	showFooter: PropTypes.bool,
	textAlign: PropTypes.string,
	useGrid: PropTypes.bool
}

DefaultLayout.defaultProps = {
	activeItem: "home",
	containerClassName: "",
	isText: false,
	showFooter: true,
	textAlign: "left",
	useGrid: true
}

export default DefaultLayout
