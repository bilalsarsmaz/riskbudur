"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { postApi, putApi, fetchApi } from "@/lib/api";
import { IconCamera, IconUser, IconCheck, IconX, IconZoomIn, IconZoomOut } from "@tabler/icons-react";
import SetupLayout from "@/components/SetupLayout";
import Cropper from "react-easy-crop";

// --- Utiltiy: Create Cropped Image ---
const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.setAttribute('crossOrigin', 'anonymous');
        image.src = url;
    });

function getRadianAngle(degreeValue: number) {
    return (degreeValue * Math.PI) / 180;
}

// Returns the new bounding area of a rotated rectangle
function rotateSize(width: number, height: number, rotation: number) {
    const rotRad = getRadianAngle(rotation);
    return {
        width:
            Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
        height:
            Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
    };
}

async function getCroppedImg(
    imageSrc: string,
    pixelCrop: { x: number; y: number; width: number; height: number },
    rotation = 0,
    flip = { horizontal: false, vertical: false }
): Promise<string> {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        return "";
    }

    const rotRad = getRadianAngle(rotation);

    // calculate bounding box of the rotated image
    const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
        image.width,
        image.height,
        rotation
    );

    // set canvas size to match the bounding box
    canvas.width = bBoxWidth;
    canvas.height = bBoxHeight;

    // translate canvas context to a central location to allow rotating and flipping around the center
    ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
    ctx.rotate(rotRad);
    ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
    ctx.translate(-image.width / 2, -image.height / 2);

    // draw rotated image
    ctx.drawImage(image, 0, 0);

    // croppedAreaPixels values are bounding box relative
    // extract the cropped image using these values
    const data = ctx.getImageData(
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height
    );

    // set canvas width to final desired crop size - this will clear existing context
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // paste generated rotate image at the top left corner
    ctx.putImageData(data, 0, 0);

    // As Base64 string
    return canvas.toDataURL('image/jpeg', 0.8);
}

export default function SetupPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [userInfo, setUserInfo] = useState<any>(null);

    // Form States
    const [nickname, setNickname] = useState("");
    const [bio, setBio] = useState("");
    const [finalProfileImage, setFinalProfileImage] = useState<string | null>(null);

    // Crop States
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);

    // Nickname Check
    const [isCheckingNick, setIsCheckingNick] = useState(false);
    const [isNickAvailable, setIsNickAvailable] = useState<boolean | null>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [fetchError, setFetchError] = useState(false);

    useEffect(() => {
        // Kullanıcı bilgilerini çek (Token yoksa ya da hata alırsa hata göster)
        fetchApi("/users/me")
            .then(data => {
                if (!data) {
                    setFetchError(true);
                } else {
                    setUserInfo(data);
                    if (data.nickname && !data.nickname.startsWith("user_")) {
                        setNickname(data.nickname);
                    }
                    if (data.profileImage) {
                        setFinalProfileImage(data.profileImage);
                    }
                }
            })
            .catch((err) => {
                console.error("Setup page fetch error:", err);
                setFetchError(true);
            });
    }, []);

    const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setImageSrc(reader.result?.toString() || null);
                setIsCropModalOpen(true); // Open modal
            });
            reader.readAsDataURL(file);
        }
    };

    const handleSaveCrop = async () => {
        if (imageSrc && croppedAreaPixels) {
            try {
                const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
                setFinalProfileImage(croppedImage);
                setIsCropModalOpen(false);
                // Reset file input value if needed (via ref) but not critical
            } catch (e) {
                console.error(e);
            }
        } else {
            // If no crop, just use original if possible? No, we force check.
            setIsCropModalOpen(false);
        }
    };

    const handleCancelCrop = () => {
        setIsCropModalOpen(false);
        setImageSrc(null);
    };

    const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
        setNickname(val);

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            // checkNickname(val); // Backend desteği eklenince açılabilir
        }, 500);
    };

    const handleFinish = async () => {
        if (!nickname) return;
        setLoading(true);

        try {
            await putApi("/users/me", {
                nickname,
                bio,
                profileImage: finalProfileImage // Send the cropped base64 image
            });

            await putApi("/users/me/complete-setup", {});

            router.push("/home");
        } catch (err) {
            alert("Bir hata oluştu. Lütfen tekrar dene.");
        } finally {
            setLoading(false);
        }
    };

    if (fetchError) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <h2 className="text-2xl font-bold mb-4 text-red-500">Kimlik Doğrulanamadı</h2>
                    <p className="mb-6 text-gray-400">
                        Kayıt sonrası bilgileriniz alınırken bir sorun oluştu. Lütfen sayfayı yenilemeyi veya tekrar giriş yapmayı deneyin.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 bg-white text-black rounded-full font-bold hover:bg-gray-200"
                        >
                            Yenile
                        </button>
                        <button
                            onClick={() => router.push("/login")}
                            className="px-6 py-2 border border-gray-700 rounded-full font-bold hover:bg-white/10"
                        >
                            Giriş'e Dön
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <SetupLayout>
            {/* CROP MODAL */}
            {isCropModalOpen && imageSrc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-[#111] border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden flex flex-col h-[500px]">
                        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#111] z-10">
                            <h3 className="font-bold">Fotoğrafı Düzenle</h3>
                            <button onClick={handleCancelCrop}><IconX size={20} /></button>
                        </div>

                        <div className="relative flex-1 bg-black">
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={1} // Square aspect ratio
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                                style={{
                                    containerStyle: { backgroundColor: 'black' },
                                    cropAreaStyle: { border: '2px solid #DC5F00' }
                                }}
                            />
                        </div>

                        <div className="p-4 bg-[#111] border-t border-gray-800 space-y-4 z-10">
                            <div className="flex items-center gap-2">
                                <IconZoomOut size={16} className="text-gray-400" />
                                <input
                                    type="range"
                                    value={zoom}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    aria-labelledby="Zoom"
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    className="w-full accent-[#DC5F00] h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                />
                                <IconZoomIn size={16} className="text-gray-400" />
                            </div>

                            <button onClick={handleSaveCrop} className="w-full py-2 bg-[#DC5F00] text-white rounded-full font-bold">
                                Uygula
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {step === 1 && (
                <div className="text-center animate-in fade-in slide-in-from-right-4 duration-300">
                    <h2 className="text-2xl font-bold mb-2">Profil Fotoğrafı Seç</h2>
                    <p className="text-gray-400 mb-8">Seni tanımaları için güzel bir fotoğrafın olsun.</p>

                    <div className="relative w-32 h-32 mx-auto mb-8 group cursor-pointer">
                        <div className={`w-full h-full rounded-full flex items-center justify-center overflow-hidden border-2 border-dashed ${finalProfileImage ? 'border-theme-accent' : 'border-gray-700'} hover:border-theme-accent transition-colors bg-[#000]`}>
                            {finalProfileImage ? (
                                <img src={finalProfileImage} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <IconUser size={48} className="text-gray-600" />
                            )}
                        </div>

                        <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
                            <IconCamera size={24} className="text-white" />
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>
                    </div>

                    <button
                        onClick={() => setStep(2)}
                        className="w-full py-3 bg-[#DC5F00] text-white rounded-full font-bold hover:bg-[#b04c00] transition-colors"
                    >
                        {finalProfileImage ? "Harika Görünüyor!" : "Şimdilik Geç"}
                    </button>
                </div>
            )}

            {step === 2 && (
                <div className="text-center animate-in fade-in slide-in-from-right-4 duration-300">
                    <h2 className="text-2xl font-bold mb-2">Kimliğini Oluştur</h2>
                    <p className="text-gray-400 mb-8">Sana nasıl hitap edelim?</p>

                    <div className="space-y-4 mb-8 text-left">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1 ml-1">Kullanıcı Adı</label>
                            <div className="relative">
                                <span className="absolute left-4 top-3 text-gray-500">@</span>
                                <input
                                    type="text"
                                    value={nickname}
                                    onChange={handleNicknameChange}
                                    className="w-full bg-black border border-gray-700 rounded-xl py-3 pl-8 pr-4 text-white focus:border-[#DC5F00] focus:ring-1 focus:ring-[#DC5F00] transition-colors"
                                    placeholder="kullaniciadi"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1 ml-1">Biyografi</label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                className="w-full bg-black border border-gray-700 rounded-xl py-3 px-4 text-white focus:border-[#DC5F00] focus:ring-1 focus:ring-[#DC5F00] transition-colors resize-none h-24"
                                placeholder="Kendinden bahset..."
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleFinish}
                        disabled={loading || !nickname}
                        className="w-full py-3 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                        {loading ? "Tamamlanıyor..." : "Riskbudur'a Başla 🚀"}
                    </button>
                </div>
            )}
        </SetupLayout>
    );
}
