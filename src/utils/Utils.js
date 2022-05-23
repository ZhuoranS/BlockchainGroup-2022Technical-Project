export const fetchTokenInfo = async (tokenURI) => {
    let regex = /\,(?!\s*?[\{\[\"\'\w])/g;
    let tokenInfo = ((await (await fetch(tokenURI)).text()).replace(regex, ''));

    return tokenInfo
}