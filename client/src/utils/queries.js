import gql from "graphql-tag";

export const GET_ME = gql`
  {
    me {
      _id
      username
      email
      bookCount
      booksSaved {
        bookId
        authors
        image
        link
        title
        description
      }
    }
  }
`;