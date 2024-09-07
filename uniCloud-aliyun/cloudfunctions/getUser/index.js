'use strict';
const db = uniCloud.database()
exports.main = async (event, context) => {
	let {_id} = event;
	return await db.collection("users").doc(_id).get()
};
