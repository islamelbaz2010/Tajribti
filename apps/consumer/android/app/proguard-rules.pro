# ML Kit ComponentRegistrar keep rules
#
# These three classes were confirmed in the NoSuchMethodException logcat trace:
#   com.google.mlkit.common.internal.CommonComponentRegistrar.<init>
#   com.google.mlkit.vision.barcode.internal.BarcodeRegistrar.<init>
#   com.google.mlkit.vision.common.internal.VisionCommonRegistrar.<init>
#
# ML Kit locates and instantiates these registrar classes via reflection during
# MlKitContext initialisation. R8 cannot trace reflection-based instantiation
# and removes their no-arg constructors in release builds, causing the failure.
# Keeping only <init>() is the minimal requirement; it preserves the constructor
# R8 would otherwise strip while letting R8 still shrink everything else.

-keep class com.google.mlkit.common.internal.CommonComponentRegistrar { <init>(); }
-keep class com.google.mlkit.vision.barcode.internal.BarcodeRegistrar { <init>(); }
-keep class com.google.mlkit.vision.common.internal.VisionCommonRegistrar { <init>(); }

# Defensive: any additional ML Kit internal registrar classes following the
# same reflection-loaded pattern (guards against transitive dependencies that
# may introduce further registrars not visible in the current logcat trace).
-keep class com.google.mlkit.**.internal.*Registrar { <init>(); }
-keep class com.google.mlkit.**.internal.*ComponentRegistrar { <init>(); }
