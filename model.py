import torch
from torch import nn
from torchvision import transforms
from torchvision.models import resnet18
from PIL import Image

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

CLASS_NAMES = [
    "Tomato_Bacterial_spot",
    "Tomato_Early_blight",
    "Tomato_Late_blight",
    "Tomato_Leaf_Mold",
    "Tomato_Septoria_leaf_spot",
    "Tomato_Spider_mites_Two_spotted_spider_mite",
    "Tomato__Target_Spot",
    "Tomato__Tomato_YellowLeaf__Curl_Virus",
    "Tomato__Tomato_mosaic_virus",
    "Tomato_healthy"
]

model = resnet18(weights=None)

model.fc = nn.Linear(
    model.fc.in_features,
    len(CLASS_NAMES)
)

model.load_state_dict(
    torch.load("PDC_ResNet18.pth",map_location=device)
)

model = model.to(device)
model.eval()

inference_transform = transforms.Compose([
    transforms.Resize((128, 128)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

def predict_image(image: Image.Image):
    image = image.convert("RGB")

    image_tensor = inference_transform(image)

    image_tensor = image_tensor.unsqueeze(0)

    image_tensor = image_tensor.to(device)

    with torch.inference_mode():
        outputs = model(image_tensor)

        probabilities = torch.softmax(outputs, dim=1)

        confidence, predicted_index = torch.max(
            probabilities,
            dim=1
        )

    predicted_class = CLASS_NAMES[predicted_index.item()]

    return {
        "prediction": predicted_class,
        "confidence": confidence.item()
    }