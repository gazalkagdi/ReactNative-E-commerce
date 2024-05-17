import { useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { ApolloClient, InMemoryCache, gql } from "@apollo/client";


interface Product {
    id: string;
    title: string;
    description: string;
    featuredImage: {
        id: string;
        url: string;
    };
    variants: {
        edges: [
            {
                node: {
                    price: {
                        amount: String
                    }
                }
            }
        ]
    };
}

interface Variant {
    node: {
        id: string;
        title: string;
        image: {
            url: string;
        };
        price: {
            amount: number;
            currencyCode: string;
        };
    };
}


const ProductPage = ({ }) => {
    const { id } = useLocalSearchParams();
    console.log(id);

    const [product, setProduct] = useState<Product | null>(null);
    const [variants, setVariants] = useState<Variant[]>([]);

    const [selectedVariant, setSelectedVariant] = useState('');
    useEffect(() => {
        const fetchData = async () => {
            try {
                const client = new ApolloClient({
                    uri: "https://mock.shop/api",
                    cache: new InMemoryCache(),
                });

                const response = await client.query({
                    query: gql`
                query GetProduct($id: ID!) {
                  product(id: $id) {
                    id
                    title
                    description
                    featuredImage {
                      id
                      url
                    }
                    variants(first: 3) {
                      edges {
                        cursor
                        node {
                          id
                          title
                          image {
                            url
                          }
                          price {
                            amount
                            currencyCode
                          }
                        }
                      }
                    }
                  }
                }
              `,
                    variables: { id },
                });
                setProduct(response.data.product)
                setVariants(response.data.product.variants.edges)
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [id]);

    const handleVariantSelect = (variant: React.SetStateAction<string>) => {
        setSelectedVariant(variant);
    };


    const handleAddToCart = () => {
        if (selectedVariant) {
            // Show toast notification with selected variant
            alert(`Added "${selectedVariant}" ${product?.title} to cart`);
        } else {
            // If no variant selected, show error message
            alert('Please select a variant');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{product?.title}</Text>

            <View style={styles.imageContainer}>
                <Image source={{ uri: product?.featuredImage?.url }} style={styles.image} />
            </View>
            <Text style={styles.productPrice}>
                {product?.variants?.edges[0]?.node.price.amount}$
            </Text>
            <Text style={styles.description}>{product?.description}</Text>
            <View style={styles.variantsContainer}>
                {variants.map((variant, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.variantButton,
                            selectedVariant === variant?.node?.title && styles.selectedVariantButton,
                        ]}
                        onPress={() => handleVariantSelect(variant?.node?.title)}
                    >
                        <Text style={styles.variantButtonText}>{variant?.node?.title}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
                <Text style={styles.addToCartButtonText}>Add to Cart</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        overflow: 'scroll'
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center'
    },
    description: {
        fontSize: 16,
        marginBottom: 30,
        textAlign: 'center',
        width: '45%',
        margin: 'auto',
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#ccc',
        paddingTop: 20,
        width: '50%',
        margin: 'auto'
    },
    image: {
        width: 300,
        height: 300,
        resizeMode: 'cover',
    },
    variantsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
        marginHorizontal: '30%'
    },
    variantButton: {
        padding: 10,
        borderWidth: 1,
        borderRadius: 5,
        borderColor: '#ccc',
    },
    selectedVariantButton: {
        borderColor: 'blue',
    },
    variantButtonText: {
        fontSize: 16,
    },
    addToCartButton: {
        backgroundColor: 'blue',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        width: '50%',
        margin: 'auto'
    },
    addToCartButtonText: {
        color: 'white',
        fontSize: 18,
    },
    productPrice: {
        fontSize: 20,
        color: 'green',
        fontWeight: 'bold',
        margin: 'auto',
        marginBottom: 20
    },
});

export default ProductPage;
