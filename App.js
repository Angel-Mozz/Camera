import { CameraView, useCameraPermissions } from "expo-camera";
import { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-pikcer";
import { Alert, View, StyleSheet, TouchableOpacity } from "react-native";

export default function CameraGalleryApp() {
  const [permission, requestPermission] = useCameraPermissions();
  const [hasGalleryPermission, setHasGalleryPermission] = useState(null);
  const [facing, setFacing] = useState("back");
  const [capturedImage, setCapturedImage] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const cameraRef = useRef(null);

  useEffect(() => {
    requestGalleryPermission();
  }, []);

  const requestGalleryPermission = async () => {
    const galleryStatus =
      await ImagePicker.requestMediaLibraryPermissionAsync();
    setHasGalleryPermission(galleryStatus === "granted");

    if (galleryStatus !== "granted") {
      Alert.alert(
        "Permiso Denegado",
        "Se necesita acceso a la galeria del telefono para usar esta funcion"
      );
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
        });
        setCapturedImage(photo.uri);
        setShowCamera(false);
      } catch (error) {
        Alert.alert("Error", "No se pudo tomar la foto");
        console.log(error);
      }
    }
  };

  const pickImageFromGallery = async () => {
    if (!hasGalleryPermission) {
      Alert.alert("Error", "No tienes permiso para acceder a la galeria");
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        setCapturedImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo seleccionar la foto");
      console.log(error);
    }
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}> Solicitando permisos</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}> No se ha concedido acceso a la camara</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Solicitar acceso a la camara</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (showCamera) {
    return (
      <View style={styles.fullScreen}>
        <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
          <View style={styles.cameraButtonContainer}>
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={toggleCameraFacing}
            >
              <Text style={styles.cameraButtonText}>🔄 Voltear</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePicture}
            >
              <View style={styles.captureInner} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cameraButton}
              onPress={() => setShowCamera(false)}
            >
              <Text style={styles.cameraButtonText}>❌ Cerrar</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📸 Cámara y Galería</Text>

      {capturedImage && (
        <Image source={{ uri: capturedImage }} style={styles.preview} />
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={() => setShowCamera(true)}
      >
        <Text style={styles.buttonText}>📷 Abrir cámara</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={pickImageFromGallery}>
        <Text style={styles.buttonText}>🖼️ Abrir galería</Text>
      </TouchableOpacity>

      {capturedImage && (
        <TouchableOpacity
          style={[styles.button, styles.clearButton]}
          onPress={() => setCapturedImage(null)}
        >
          <Text style={styles.buttonText}>🧹 Limpiar imagen</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // --- Estructura principal ---
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#222",
  },
  text: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 10,
  },

  // --- Botones ---
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginVertical: 8,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  clearButton: {
    backgroundColor: "#ff4d4d",
  },

  // --- Cámara ---
  fullScreen: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
    justifyContent: "flex-end",
  },
  cameraButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingVertical: 15,
  },
  cameraButton: {
    padding: 10,
  },
  cameraButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderWidth: 4,
    borderColor: "#fff",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  captureInner: {
    width: 50,
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 25,
  },

  // --- Imagen previa ---
  preview: {
    width: 250,
    height: 250,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#ccc",
  },
});
