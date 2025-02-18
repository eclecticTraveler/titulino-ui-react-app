import React from 'react';
import { Spin } from 'antd';
import PropTypes from 'prop-types'
import { LoadingOutlined } from '@ant-design/icons';

const Icon = <LoadingOutlined style={{ fontSize: 35 }} spin />

const Loading = (props) => {
	const { align = 'center', cover = 'inline' } = props
	return (
		<div className={`loading text-${align} cover-${cover}`}>
			<Spin indicator={Icon} />
		</div>
	)
}

Loading.propTypes = {
	size: PropTypes.string,
	cover: PropTypes.string
}

export default Loading