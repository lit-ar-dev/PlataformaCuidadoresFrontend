import { ActivityIndicator, Button, FlatList, RefreshControl, StyleSheet, View } from "react-native";

import { Cuidador } from "@/src/api/cuidadores";
import { ThemedText } from "@/src/components/themed-text";
import { ThemedView } from "@/src/components/themed-view";
import { CuidadoresCard } from "@/src/components/ui/cuidadores-card";
import TextInputField from "@/src/components/ui/text-input-field";
import { useCuidadores } from "@/src/hooks/use-cuidadores";
import React, { useRef, useState } from "react";


export default function CuidadoresScreen(){
  const { loading, error, cuidadores, refresh } = useCuidadores();
  const [search, setSearch] = useState('');
  const inputRef = useRef(null);
  const handleSearch = () => {
    console.log('Buscando:', search);
  };

  const renderItem = ({ item }: { item: Cuidador }) => {
    const cuidador = item;
    return <CuidadoresCard cuidador={cuidador} />;
  };

    return(
        <ThemedView style={styles.mainModule}>
            <ThemedText>
              <View>
                <TextInputField
                  ref={inputRef}
                  label="Buscar"
                  placeholder="Escribí algo..."
                  value={search}
                  onChangeText={setSearch}
                  error={search.length > 20 ? "Demasiado largo!" : undefined}
                />
                <Button title="Buscar" onPress={handleSearch} />
              </View>
              {loading ? <ActivityIndicator/> : null}
              {error ? <ThemedText>{error}</ThemedText> : null}
              </ThemedText>
              <ThemedText>
                <FlatList
                  data={cuidadores}
                  renderItem={renderItem}
                  keyExtractor={(item, index) => {
                    const cuidador = item;
                    return cuidador.id ? cuidador.id.toString() : index.toString();
                  }}
                  refreshControl={
                    <RefreshControl
                      refreshing={loading}
                      onRefresh={refresh}
                      colors={["#007AFF"]}
                    />
                  }
                  showsVerticalScrollIndicator={false}
                  />
              </ThemedText>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
  mainModule: {
    paddingLeft: 0,
    alignItems: "center",
    justifyContent: "center"
  }
});