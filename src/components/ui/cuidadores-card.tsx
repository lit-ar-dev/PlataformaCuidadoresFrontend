import { StyleSheet } from "react-native";

import { Cuidador } from "@/src/api/cuidadores";
import { ThemedText } from "../themed-text";
import { ThemedView } from "../themed-view";

type Props = {
    cuidador: Cuidador;
};

export function CuidadoresCard({
    cuidador,
}: Props)  {
    return(
        <ThemedView style={styles.card}>
                <ThemedView key={cuidador.id}>
                    {/* <ThemedText style={styles.name}>{cuidador.usuario.persona.nombre} - {cuidador.usuario.persona.apellido}</ThemedText> */}
                    <ThemedView style={styles.name}>
                        <ThemedText>{cuidador.descripcion}</ThemedText>
                    </ThemedView>
                    <ThemedView style={styles.tarifa}>
                        <ThemedText>
                            {cuidador.tarifas.map((tarifa, tarifa_index) => (
                                <ThemedText key={tarifa_index}>
                                    <ThemedText>{tarifa.servicio?.nombre}</ThemedText>
                                    <ThemedText>{tarifa.grupo?.nombre ?? "Sin grupo" }: </ThemedText>
                                    <ThemedText>{tarifa.precio ?? "—"}$</ThemedText>
                                </ThemedText>
                            ))}
                        </ThemedText>
                    </ThemedView>
                    <ThemedView style={styles.tags}>
                        {cuidador.tags.map((tag, tag_index) => (
                            <ThemedText key={tag_index}>
                                <ThemedText>"{tag.nombre}" </ThemedText>
                            </ThemedText>
                        ))}
                    </ThemedView>
                </ThemedView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    card:{
        backgroundColor: "#808080ff",
        borderRadius: 16,
        padding: 10,
        marginVertical: 8,
        elevation: 3,
        flexDirection: "column",
        maxWidth:600,
        marginHorizontal:15
    },
    name:{
        backgroundColor: "#444977ff"
    },
    tarifa:{
        backgroundColor: "#4b4e69ff"
    },
    tags:{
        backgroundColor: "#4c4d57ff",
        paddingLeft:16
    },
});