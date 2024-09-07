'use strict';

const db = uniCloud.database();

exports.main = async (event, context) => {
	let {userName,avatar,gender,age,phone} = event;
	return await db.collection('users').add({userName,avatar,chatRecords: [],gender,age,phone});

};