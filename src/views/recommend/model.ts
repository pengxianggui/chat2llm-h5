/**
 * 推荐问题
 */
export class RecommendQustion {
    // 问题内容
    query: string = '';
    // 知识库
    knowledgeName?: string;

    constructor(query: string, knowledgeName ?: string) {
        this.query = query
        this.knowledgeName = knowledgeName
    }
}