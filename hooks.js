module.exports = [
	function(content) {
		return content.match(/(function .+\s*)\(/g);
	}
]