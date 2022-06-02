import fetch from 'node-fetch';

let searchList = process.argv.slice(2);

const getSWresult = async (params) => {
	const result = await Promise.all(params.map(item => {
		let replaserParam = item.replace(/\s/g, '%20');
		return fetch(`https://swapi.dev/api/people/?search=${replaserParam}`)
			.then(data => data.json())
			.then(data => data)
	}))
	return result;
}

let final = await getSWresult(searchList)

if (final.some(item => item.count !== 0)) {

	let count = 0;
	let all = [];
	let minHeight;
	let maxHeight;

	final.forEach((item, i) => {
		if (item.count === 0) {
			console.log(`No results found for ${searchList[i]}`)
		} else {
			count += item.count;
			item.results.map((item) => all.push(item))
		}
	})

	all.forEach(item => {
		minHeight === undefined ? minHeight = item : null
		maxHeight === undefined ? maxHeight = item : null
		
		parseInt(minHeight.height) >= parseInt(item.height) ? minHeight = item : null;
		parseInt(maxHeight.height) <= parseInt(item.height) ? maxHeight = item : null;
	})

	let allNames = all.map(item => item.name).sort();

	console.log(`Total results: ${count}.`)
	console.log(`All: ${allNames.join(', ')}.`)
	console.log(`Min height: ${minHeight.name}, ${minHeight.height} cm.`)
	console.log(`Max height: ${maxHeight.name}, ${maxHeight.height} cm.`)
}