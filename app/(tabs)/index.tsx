import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ApolloClient, InMemoryCache, ApolloProvider, gql } from '@apollo/client';
import { Link } from 'expo-router';

// Initialize Apollo Client
const client = new ApolloClient({
  uri: 'https://mock.shop/api',
  cache: new InMemoryCache(),
});

interface Product {
  variants: any;
  node: any;
  id: string;
  title: string;
  description: string;
  featuredImage: {
    id: string;
    url: string;
  }
}

interface Collection {
  node: any;
  id: string;
  title: string;
  description: string;
  image: {
    id: string;
    url: string;
  };
  products: {
    edges: { node: Product }[];
  };
}

const App: React.FC = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [products, setProducts] = useState<{ node: Product }[]>([]); // Adjusted type here

  useEffect(() => {
    const fetchData = async () => {
      try {

        // Query to fetch collections
        const response = await client.query({
          query: gql`
            {
              collections(first: 2) {
                edges {
                  cursor
                  node {
                    id
                    handle
                    title
                    description
                    image {
                      id
                      url
                    }
                  }
                }
              }
            }
          `,
        });

        // Query to fetch products
        const response2 = await client.query({
          query: gql`
            {
              products(first: 4) {
                edges {
                  node {
                    id
                    title
                    description
                    featuredImage {
                      id
                      url
                    }
                    variants(first: 3) {
                      edges {
                        node {
                          price {
                            amount
                            currencyCode
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          `,
        });

        setProducts(response2.data.products.edges);
        setCollections(response.data.collections.edges);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);


  return (
    <ApolloProvider client={client}>
      <ScrollView style={styles.container}>
        <Image source={{ uri: 'https://marketplace.canva.com/EAFw2F62lZw/1/0/1600w/canva-simple-modern-photo-collage-autumn-fashion-sale-banner-hZQHBJfu4c4.jpg' }} style={styles.heroImage} />
        {collections.map((collection, collectionIndex) => (
          <View key={collectionIndex} style={styles.collectionContainer}>
            <Text style={styles.collectionTitle}>{collection.node.title}</Text>
            <Text style={styles.collectionDescription}>{collection.node.description}</Text>

            <View style={styles.productContainer}>
              {products
                .filter(product => product.node.featuredImage && product.node.title)
                .slice(collectionIndex * 2, collectionIndex * 2 + 2)
                .map((product, productIndex) => (
                  <Link
                    href={{
                      pathname: "/product/[id]",
                      params: { id: product.node.id },
                    }} asChild key={productIndex}>
                    <View key={productIndex} style={styles.productCard} >
                      <Image source={{ uri: product.node.featuredImage.url }} style={styles.productImage} />
                      <Text style={styles.productTitle}>{product.node.title}</Text>
                      <Text style={styles.productPrice}>
                        {product.node.variants.edges[0]?.node.price.amount}$
                      </Text>
                    </View>
                  </Link>
                ))}
            </View>

          </View>
        ))}
      </ScrollView>
    </ApolloProvider >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  heroImage: {
    width: '100%',
    height: 600,
    marginBottom: 30
  },
  collectionContainer: {
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  collectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center'
  },
  collectionDescription: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    width: '45%',
    margin: 'auto',
  },
  productContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  productCard: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    alignItems: 'center'
  },
  productImage: {
    width: 250,
    height: 300,
    marginBottom: 5,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10
  },
  productPrice: {
    fontSize: 20,
    color: 'green',
    fontWeight: 'bold',
  },
});

export default App;
