import { getTokenURI } from "./Web3Client";

export const fetchTokenInfo = async (tokenId) => {
    let regex = /\,(?!\s*?[\{\[\"\'\w])/g;
    let tokenURI = await getTokenURI(tokenId)
    let tokenInfo = ((await (await fetch(tokenURI)).text()).replace(regex, ''));

    return tokenInfo
}