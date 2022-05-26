import { getTokenURI } from "./Web3Client";

export const fetchTokenInfo = async (tokenId) => {
    let regex = /\,(?!\s*?[\{\[\"\'\w])/g;
    let tokenURI = await getTokenURI(tokenId)
    let tokenInfo = ((await (await fetch(tokenURI)).text()).replace(regex, ''));

    return tokenInfo
}

export const getAuctionEndTime = (auctionEndTime) => {
    const auctionEndDate = new Date(auctionEndTime * 1000).toISOString()
    const auctionEndYear = auctionEndDate.substring(0,4)
    const auctionEndMonth = auctionEndDate.substring(5,7)
    const auctionEndDay = auctionEndDate.substring(8,10)
    const auctionEndHour = auctionEndDate.substring(11,13)
    const auctionEndMinute = auctionEndDate.substring(14,16)

    const auctionEnd = auctionEndMonth + '/' + auctionEndDay + '/' + auctionEndYear + ' @ ' + auctionEndHour + ':' + auctionEndMinute
    
    return auctionEnd
}