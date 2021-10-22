const { ApolloServer, gql } = require("apollo-server");
const { GraphQLScalarType, Kind } = require("graphql");

const user = [
  {
    id: 1,
    email: "mat@gmail.com",
    password: "pwd",
    firstName: "Mat",
    lastName: "Marc",
    pseudo: "LM",
  },
  {
    id: 2,
    email: "Sam@gmail.com",
    password: "pwd2",
    firstName: "Sam",
    lastName: "Samm",
    pseudo: "MJ",
  }
];

let posts = [
  {
    id: 1,
    author: {
      id: 1,
      email: "alex@gmail.com",
      password: "pwd",
      firstName: "Alex",
      lastName: "Marcus",
      pseudo: "AM",
    },
    content: "voici votre post",
    comments: [
      {
        id: 1,
        id_post: 1,
        id_author:1,
        content: "Beau post ! "
      },
      {
        id: 1,
        id_post: 1,
        id_author:1,
        content: "Beau post! "
      },

    ],
    createdAt: "2020-10-11",
    updatedAt: null,
  },
  {
    id: 2,
    author: {
      id: 1,
      email: "mar@gmail.com",
      password: "pwd",
      firstName: "Karim",
      lastName: "Billel",
      pseudo: "KB",
    },
    content: "voici mon post",
    comments: [],
    createdAt: "2012-10-13",
    updatedAt: null,
  }
];


let comments = [
  {
    id: 1,
    id_post: 1,
    id_author:1,
    content: "MERCI POUR VOTRE POST! "
  },
  {
    id: 2,
    id_post: 1,
    id_author:1,
    content: "MERCI POUR VOTRE POST!! "
  }
];

const def = gql`
  scalar Date

  type User {
    Id: Int!
    Email: String!
    Password: String!
    FirstName: String
    LastName: String
    Pseudo: String
  }

  type Comment {
    Id: Int!
    Id_post: Int!
    Id_author: Int!
    Content: String!
  }

  
  input Comment2 {
    Id: Int!
    Id_post: Int!
    Id_author: Int!
    Content: String!
  }

  type Post {
    Id: Int!
    Author: User!
    Content: String!
    Comments: [Comment]
    CreatedAt: Date
    UpdatedAt: Date
  }


  type Query {
    Users: [User]
    Posts: [Post]
    Post_id(id_post:Int): Post!
    Hello: String
    Readcommentpost(post_id : Int): [Comment]!
    Readcommentid(comment_id : Int): Comment!
  }

  type Mutation {
    Createpost(id: Int, id_author: Int,content: String, comments: [Comment2]): Post!
    Updatepost(post_id : Int,content: String): Post!
    Deletepost(post_id : Int): Post!
    Createcommentpost(post_id : Int,comments: [Comment2]): Post!
    Updatecomment(comment_id : Int,content: String): Comment!
    Deletecomment(comment_id : Int): Comment!
  }


`;

const dateScalar = new GraphQLScalarType({
  name: "Date",
  description: "Date custom scalar type",
  serialize(value) {
    return value.getTime(); // Convert outgoing Date to integer for JSON
  },
  parseValue(value) {
    return new Date(value); // Convert incoming integer to Date
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      return new Date(parseInt(ast.value, 10)); // Convert hard-coded AST string to integer and then to Date
    }
    return null; // Invalid hard-coded value (not an integer)
  },
});

const resolvers = {
  Date: dateScalar,
  Query: {
    users: () =>  users,
    posts: () => posts,
    hello: () => "hello world",
    post_id: (_, args) => {
      let post = posts.filter(tab => tab.id == args.id_post)
      console.log(post)

      if(post == -1){

        let post_i =   {
          id: 404,
          content: "AUCUN POST A CETTE ID",
        }
        return post_i
      }

      return post[0]


    },
    readcommentpost: (_, args) => {
      let post = posts.filter(tab => tab.id == args.post_id)
      let post_index = posts.findIndex(tab => tab.id == args.post_id)
      if(post.length == 0){
        let post_i =   {
          id: 404,
          content: "AUCUN POST A CETTE ID",
        }
        return post_i
      }
   
    

      return posts[post_index].comments
    },

    readcommentid: (_, args) => {
      let comment = comments.filter(tab => tab.id == args.comment_id)
      let comment_index = comments.findIndex(tab => tab.id == args.comment_id)
      console.log(comment)
      if(comment_index == -1){
        let post_i =   {
          id: 404,
          content: "PAS DE COMMENT A CETTE ID",
          id_post: 404,
          id_author:404
        }
        return post_i
      }
   
    

      return comments[comment_index]
    }
  },
  Mutation:{
    createpost: (_, args) => {
      let id = posts.length+1;
      let comments,content
      [author,comments,content] = [args.id_author,args.comments,args.content]
      const postsUpdated = {id,author,comments,content}
      console.log("post",posts)
      posts.push(postsUpdated)
      console.log("postsUpdate",postsUpdated);
      return postsUpdated;
    },
    updatepost: (_, args) => {
      let post = posts.filter(tab => tab.id == args.post_id)
      let post_index = posts.findIndex(tab => tab.id == args.post_id)
      console.log(post_index)
      if(post.length == 0){
        let comment_error =     {
          id: 404,
          id_post: 404,
          id_author:404,
          content: "ERREUR POUR LE COMMENTAIRE DE CET ID"
        }
        return comment_error
      }
      posts[post_index].content = args.content

      return posts[post_index]
    },
    deletepost: (_, args) => {
      let post = posts.filter(tab => tab.id == args.post_id)
      let post_index = posts.findIndex(tab => tab.id == args.post_id)
      if(post.length == 0){
        let post_i =   {
          id: 404,
          content: "PAS POST A CETTE ID",
        }
        return post_i
      }
      
      let stock_post = posts[post_index]
      let newPosts = posts.filter(tab => tab.id != args.post_id)
      posts = newPosts
      console.log(newPosts)

      return stock_post
    },

    createcommentpost: (_, args) => {
      let post = posts.filter(tab => tab.id == args.post_id)
      let post_index = posts.findIndex(tab => tab.id == args.post_id)
      console.log(args.comments[0])
      if(post.length == 0){
        let post_i =   {
          id: 404,
          content: "PAS POST A CETTE ID",
        }
        return post_i
      }
      
      posts[post_index].comments.push(args.comments[0])
    

      return posts[post_index]
    },

    updatecomment: (_, args) => {
      let comment = comments.filter(tab => tab.id == args.comment_id)
      let comment_index = comments.findIndex(tab => tab.id == args.comment_id)
      console.log(comment_index)
      if(comment.length == 0){
        let comment_error =     {
          id: 404,
          id_post: 404,
          id_author:404,
          content: "PAS POST A CETTE ID"
        }
        return comment_error
      }
      
      comments[comment_index].content = args.content
      console.log(comments[comment_index])
      return comments[comment_index]
    },
    deletecomment: (_, args) => {
      let comment = comments.filter(tab => tab.id == args.comment_id)
      let comment_index = comments.findIndex(tab => tab.id == args.comment_id)
      if(comment.length == 0){
        let comment_error =     {
          id: 404,
          id_post: 404,
          id_author:404,
          content: "PAS POST A CETTE ID"
        }
        return comment_error
      }
      
      let stock_comment = comments[comment_index]
      let newComments = comments.filter(tab => tab.id != args.comment_id)
      comments = newComments
      console.log(newComments)
  
      return stock_comment
    }
  },


};

const server = new ApolloServer({ def, resolvers });
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
