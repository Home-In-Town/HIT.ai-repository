import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Linking,
  FlatList,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants';
import { ProjectProperty } from '../../types';
import { projectService } from '../../services';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Format price number into ₹ Cr / L display.
 */
function formatPrice(value?: number): string {
  if (!value) return 'Price on Request';
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(0)} L`;
  return `₹${value.toLocaleString('en-IN')}`;
}

export default function PropertyDetailScreen({ route, navigation }: any) {
  const { property } = route.params as { property: ProjectProperty };

  const [activeSlide, setActiveSlide] = useState(0);
  const [showPriceBreakdown, setShowPriceBreakdown] = useState(false);
  const scrollX = useRef(new Animated.Value(0)).current;

  // All images: cover + gallery
  const allImages = [property.image, ...(property.galleryImages || [])].filter(Boolean);

  // Auto-scroll carousel
  const flatListRef = useRef<FlatList>(null);
  useEffect(() => {
    if (allImages.length <= 1) return;
    const interval = setInterval(() => {
      const next = (activeSlide + 1) % allImages.length;
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
      setActiveSlide(next);
    }, 3000);
    return () => clearInterval(interval);
  }, [activeSlide, allImages.length]);

  const getPriceBreakdown = () => {
    if (!property.startingPrice) return null;
    const base = property.startingPrice;
    const isUC = property.projectStatus !== 'ready-to-move';
    const bd = property.priceBreakdown;

    if (bd && bd.totalPrice) {
      const fmt = (n?: number) => {
        if (!n) return null;
        return n >= 10000000 ? `₹${(n / 10000000).toFixed(2)} Cr` : `₹${(n / 100000).toFixed(1)} L`;
      };
      return {
        base: fmt(bd.basePrice || base) || formatPrice(base),
        gst: fmt(bd.gst),
        gstRate: `${bd.gstPercentage || 5}%`,
        stamp: fmt(bd.stampDuty),
        stampRate: `${bd.stampDutyPercentage || 5.5}%`,
        reg: fmt(bd.registration),
        regRate: `${bd.registrationPercentage || 1}%`,
        legalCharges: fmt(bd.legalCharges),
        maintenanceDeposit: fmt(bd.maintenanceDeposit),
        otherCharges: fmt(bd.otherCharges),
        total: fmt(bd.totalPrice)!,
        isUC,
      };
    }

    // Fallback calculation
    const gst = isUC ? Math.round(base * 0.05) : 0;
    const stamp = Math.round(base * 0.055);
    const reg = Math.round(base * 0.01);
    const total = base + gst + stamp + reg;
    return {
      base: formatPrice(base),
      gst: gst > 0 ? formatPrice(gst) : null,
      gstRate: isUC ? '5%' : '0%',
      stamp: formatPrice(stamp),
      stampRate: '~5.5%',
      reg: formatPrice(reg),
      regRate: '~1%',
      legalCharges: null as string | null,
      maintenanceDeposit: null as string | null,
      otherCharges: null as string | null,
      total: formatPrice(total),
      isUC,
    };
  };

  const breakdown = getPriceBreakdown();

  const handleCall = () => {
    if (property.cta?.callNumber) {
      projectService.trackCta({ projectId: property.id, ctaType: 'call', phone: property.cta.callNumber });
      Linking.openURL(`tel:${property.cta.callNumber}`);
    }
  };

  const handleWhatsApp = () => {
    if (property.cta?.whatsappNumber) {
      projectService.trackCta({ projectId: property.id, ctaType: 'whatsapp', phone: property.cta.whatsappNumber });
      Linking.openURL(`https://wa.me/91${property.cta.whatsappNumber}`);
    }
  };

  const handleBookVisit = () => {
    projectService.trackCta({ projectId: property.id, ctaType: 'book_visit' });
    // Could open enquiry modal in future
    if (property.cta?.whatsappNumber) {
      const msg = encodeURIComponent(`Hi, I'm interested in ${property.property_name}. I'd like to book a site visit.`);
      Linking.openURL(`https://wa.me/91${property.cta.whatsappNumber}?text=${msg}`);
    }
  };

  const getStatusBadge = () => {
    switch (property.projectStatus) {
      case 'ready-to-move':
        return { label: '✅ READY TO MOVE', bg: '#DCFCE7', color: '#15803D' };
      case 'pre-launch':
        return { label: '🔔 PRE-LAUNCH', bg: '#DBEAFE', color: '#1D4ED8' };
      default:
        return { label: '🏗️ UNDER CONSTRUCTION', bg: '#FEF3C7', color: '#92400E' };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <View style={styles.container}>
      {/* Sticky Header CTA Bar */}
      <View style={styles.stickyHeader}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerLogo}>
            <Text style={styles.headerLogoText}>HomeInTown</Text>
            <Text style={styles.headerLogoAi}>.ai</Text>
          </View>
        </View>
        <View style={styles.headerCta}>
          {property.cta?.callNumber && (
            <TouchableOpacity style={styles.headerCtaBtn} onPress={handleCall}>
              <Text style={styles.headerCtaBtnText}>📞 Call</Text>
            </TouchableOpacity>
          )}
          {property.cta?.whatsappNumber && (
            <TouchableOpacity style={[styles.headerCtaBtn, styles.headerCtaBtnOutline]} onPress={handleWhatsApp}>
              <Text style={styles.headerCtaBtnOutlineText}>WhatsApp</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Status Badge */}
        {property.projectStatus && (
          <View style={styles.badgeRow}>
            <View style={[styles.statusBadge, { backgroundColor: statusBadge.bg }]}>
              <Text style={[styles.statusBadgeText, { color: statusBadge.color }]}>
                {statusBadge.label}
              </Text>
            </View>
          </View>
        )}

        {/* Property Name */}
        <View style={styles.nameSection}>
          <Text style={styles.propertyName}>{property.property_name}</Text>
          {property.builder && (
            <Text style={styles.builderName}>By {property.builder}</Text>
          )}
        </View>

        {/* Location */}
        <View style={styles.locationRow}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.locationText}>
            {property.location?.toUpperCase()}{property.city ? `, ${property.city.toUpperCase()}` : ''}
          </Text>
        </View>

        {/* BHK Options */}
        {property.bhkOptions && property.bhkOptions.length > 0 && (
          <Text style={styles.bhkText}>{property.bhkOptions.join(' · ')}</Text>
        )}

        {/* Price Section */}
        <View style={styles.priceSection}>
          <View>
            <Text style={styles.priceLabel}>Price starting from</Text>
            <Text style={styles.priceValue}>
              {formatPrice(property.startingPrice)}
              <Text style={styles.priceOnwards}> onwards</Text>
            </Text>
            {property.pricePerSqFt ? (
              <Text style={styles.priceSqft}>₹{property.pricePerSqFt.toLocaleString('en-IN')}/sq.ft</Text>
            ) : null}
          </View>
          {property.carpetAreaRange && (
            <View style={styles.areaSection}>
              <Text style={styles.areaValue}>
                {property.carpetAreaRange.split('-').pop()?.trim() || property.carpetAreaRange}
              </Text>
              <Text style={styles.areaLabel}>SQFT CARPET</Text>
            </View>
          )}
        </View>

        {/* Price Breakdown Toggle */}
        <TouchableOpacity
          style={styles.breakdownToggle}
          onPress={() => setShowPriceBreakdown(!showPriceBreakdown)}
        >
          <Text style={styles.breakdownToggleText}>
            {showPriceBreakdown ? '▲' : '▼'} See price details
          </Text>
        </TouchableOpacity>

        {showPriceBreakdown && breakdown && (
          <View style={styles.breakdownCard}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Base Price</Text>
              <Text style={styles.breakdownValue}>{breakdown.base}</Text>
            </View>
            {breakdown.gst ? (
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>GST ({breakdown.gstRate})</Text>
                <Text style={styles.breakdownValue}>{breakdown.gst}</Text>
              </View>
            ) : (
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>GST</Text>
                <Text style={[styles.breakdownValue, { color: Colors.success }]}>Exempt ✓</Text>
              </View>
            )}
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Stamp Duty ({breakdown.stampRate})</Text>
              <Text style={styles.breakdownValue}>{breakdown.stamp}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Registration ({breakdown.regRate})</Text>
              <Text style={styles.breakdownValue}>{breakdown.reg}</Text>
            </View>
            {breakdown.legalCharges && (
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Legal Charges</Text>
                <Text style={styles.breakdownValue}>{breakdown.legalCharges}</Text>
              </View>
            )}
            {breakdown.maintenanceDeposit && (
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Maintenance Deposit</Text>
                <Text style={styles.breakdownValue}>{breakdown.maintenanceDeposit}</Text>
              </View>
            )}
            <View style={[styles.breakdownRow, styles.breakdownTotal]}>
              <Text style={styles.breakdownTotalLabel}>Total (approx)</Text>
              <Text style={styles.breakdownTotalValue}>{breakdown.total}</Text>
            </View>
            <Text style={styles.breakdownDisclaimer}>
              * Approximate charges. Consult builder for exact costs.
            </Text>
          </View>
        )}

        {/* RERA Badge */}
        {property.reraApproved && property.reraNumber && (
          <View style={styles.reraBadge}>
            <Text style={styles.reraBadgeText}>✅ RERA: P{property.reraNumber}</Text>
          </View>
        )}

        {/* Image Carousel */}
        {allImages.length > 0 && (
          <View style={styles.carouselContainer}>
            <FlatList
              ref={flatListRef}
              data={allImages}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                { useNativeDriver: false }
              )}
              onMomentumScrollEnd={(e) => {
                const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                setActiveSlide(index);
              }}
              renderItem={({ item }) => (
                <Image source={{ uri: item }} style={styles.carouselImage} resizeMode="cover" />
              )}
              keyExtractor={(_, i) => `img-${i}`}
            />
            {/* Image counter */}
            <View style={styles.imageCounter}>
              <Text style={styles.imageCounterText}>
                {activeSlide + 1}/{allImages.length}
              </Text>
            </View>
            {/* Actual Site Photo badge */}
            <View style={styles.sitePhotoBadge}>
              <Text style={styles.sitePhotoBadgeText}>Actual Site Photo</Text>
            </View>
            {/* Dots */}
            {allImages.length > 1 && (
              <View style={styles.dotsRow}>
                {allImages.map((_, i) => (
                  <View
                    key={`dot-${i}`}
                    style={[styles.dot, i === activeSlide && styles.dotActive]}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {/* CTA Row */}
        <View style={styles.ctaRow}>
          {property.cta?.callNumber && (
            <TouchableOpacity style={styles.ctaButton} onPress={handleCall}>
              <Text style={styles.ctaButtonText}>📞 Call</Text>
            </TouchableOpacity>
          )}
          {property.cta?.whatsappNumber && (
            <TouchableOpacity style={[styles.ctaButton, styles.ctaWhatsApp]} onPress={handleWhatsApp}>
              <Text style={styles.ctaWhatsAppText}>💬 WhatsApp</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.ctaButton, styles.ctaBookVisit]} onPress={handleBookVisit}>
            <Text style={styles.ctaBookVisitText}>
              {property.cta?.buttonText || 'Book Visit'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Amenities */}
        {property.amenities.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Facilities</Text>
            <View style={styles.amenitiesGrid}>
              {property.amenities.slice(0, 12).map((amenity, i) => (
                <View key={`amenity-${i}`} style={styles.amenityChip}>
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Configuration Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {property.type === 'plot' ? 'Plot Details' : 'Flat Details'}
          </Text>
          <View style={styles.configGrid}>
            {property.bhkOptions && property.bhkOptions.length > 0 && (
              <View style={styles.configItem}>
                <Text style={styles.configLabel}>BHK Options</Text>
                <Text style={styles.configValue}>{property.bhkOptions.join(', ')}</Text>
              </View>
            )}
            {property.carpetAreaRange && (
              <View style={styles.configItem}>
                <Text style={styles.configLabel}>Carpet Area</Text>
                <Text style={styles.configValue}>{property.carpetAreaRange}</Text>
              </View>
            )}
            {property.floorRange && (
              <View style={styles.configItem}>
                <Text style={styles.configLabel}>Floors</Text>
                <Text style={styles.configValue}>{property.floorRange}</Text>
              </View>
            )}
            {property.plotSizeRange && (
              <View style={styles.configItem}>
                <Text style={styles.configLabel}>Plot Size</Text>
                <Text style={styles.configValue}>{property.plotSizeRange}</Text>
              </View>
            )}
            {property.facingOptions && property.facingOptions.length > 0 && (
              <View style={styles.configItem}>
                <Text style={styles.configLabel}>Facing</Text>
                <Text style={styles.configValue}>{property.facingOptions.join(', ')}</Text>
              </View>
            )}
            {property.gatedCommunity !== undefined && (
              <View style={styles.configItem}>
                <Text style={styles.configLabel}>Gated Community</Text>
                <Text style={styles.configValue}>{property.gatedCommunity ? 'Yes ✓' : 'No'}</Text>
              </View>
            )}
            {property.bankLoanAvailable !== undefined && (
              <View style={styles.configItem}>
                <Text style={styles.configLabel}>Bank Loan</Text>
                <Text style={styles.configValue}>{property.bankLoanAvailable ? 'Available ✓' : 'N/A'}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Sticky Header
  stickyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 48,
    paddingBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerLogo: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  headerLogoText: {
    fontSize: Typography.bodySmall,
    fontWeight: Typography.black,
    color: Colors.primary,
  },
  headerLogoAi: {
    fontSize: Typography.bodySmall,
    fontWeight: Typography.black,
    color: Colors.textPrimary,
  },
  headerCta: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  headerCtaBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  headerCtaBtnText: {
    fontSize: Typography.caption,
    fontWeight: Typography.medium,
    color: Colors.textInverse,
  },
  headerCtaBtnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  headerCtaBtnOutlineText: {
    fontSize: Typography.caption,
    fontWeight: Typography.medium,
    color: Colors.primary,
  },

  // Content
  scrollView: {
    flex: 1,
  },
  badgeRow: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  statusBadgeText: {
    fontSize: Typography.tiny,
    fontWeight: Typography.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  nameSection: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  propertyName: {
    fontSize: Typography.h1,
    fontWeight: Typography.black,
    color: Colors.textPrimary,
    textTransform: 'uppercase',
    lineHeight: 34,
  },
  builderName: {
    fontSize: Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    gap: Spacing.xs,
  },
  locationIcon: {
    fontSize: 12,
    marginTop: 2,
  },
  locationText: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  bhkText: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.semiBold,
    color: Colors.textPrimary,
  },

  // Price
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  priceLabel: {
    fontSize: Typography.tiny,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priceValue: {
    fontSize: 28,
    fontWeight: Typography.black,
    color: Colors.textPrimary,
  },
  priceOnwards: {
    fontSize: Typography.bodySmall,
    fontWeight: Typography.regular,
    color: Colors.textSecondary,
  },
  priceSqft: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  areaSection: {
    alignItems: 'flex-end',
  },
  areaValue: {
    fontSize: Typography.h2,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  areaLabel: {
    fontSize: Typography.tiny,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
  },

  // Breakdown
  breakdownToggle: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  breakdownToggleText: {
    fontSize: Typography.caption,
    color: Colors.secondary,
  },
  breakdownCard: {
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs + 2,
  },
  breakdownLabel: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
  },
  breakdownValue: {
    fontSize: Typography.caption,
    fontWeight: Typography.semiBold,
    color: Colors.textPrimary,
  },
  breakdownTotal: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: Spacing.xs,
    paddingTop: Spacing.sm,
  },
  breakdownTotalLabel: {
    fontSize: Typography.caption,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  breakdownTotalValue: {
    fontSize: Typography.caption,
    fontWeight: Typography.bold,
    color: Colors.primary,
  },
  breakdownDisclaimer: {
    fontSize: 9,
    color: Colors.textTertiary,
    marginTop: Spacing.sm,
  },

  // RERA
  reraBadge: {
    alignSelf: 'flex-start',
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: BorderRadius.sm,
  },
  reraBadgeText: {
    fontSize: Typography.caption,
    color: Colors.primaryDark,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },

  // Carousel
  carouselContainer: {
    position: 'relative',
    marginTop: Spacing.lg,
    height: 220,
  },
  carouselImage: {
    width: SCREEN_WIDTH,
    height: 220,
  },
  imageCounter: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  imageCounterText: {
    fontSize: Typography.tiny,
    color: Colors.textInverse,
  },
  sitePhotoBadge: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  sitePhotoBadgeText: {
    fontSize: Typography.tiny,
    fontWeight: Typography.bold,
    color: Colors.textInverse,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dotsRow: {
    position: 'absolute',
    bottom: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotActive: {
    backgroundColor: '#FFFFFF',
  },

  // CTA Row
  ctaRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  ctaButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  ctaButtonText: {
    fontSize: Typography.caption,
    fontWeight: Typography.medium,
    color: Colors.textPrimary,
  },
  ctaWhatsApp: {
    backgroundColor: Colors.whatsapp,
    borderColor: Colors.whatsapp,
  },
  ctaWhatsAppText: {
    fontSize: Typography.caption,
    fontWeight: Typography.medium,
    color: Colors.textInverse,
  },
  ctaBookVisit: {
    backgroundColor: Colors.ctaRed,
    borderColor: Colors.ctaRed,
  },
  ctaBookVisitText: {
    fontSize: Typography.caption,
    fontWeight: Typography.medium,
    color: Colors.textInverse,
  },

  // Sections
  section: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.bodySmall,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  amenityChip: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  amenityText: {
    fontSize: Typography.caption,
    color: Colors.textPrimary,
  },
  configGrid: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
  },
  configItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  configLabel: {
    fontSize: Typography.caption,
    color: Colors.textTertiary,
  },
  configValue: {
    fontSize: Typography.bodySmall,
    fontWeight: Typography.medium,
    color: Colors.textPrimary,
  },
});
