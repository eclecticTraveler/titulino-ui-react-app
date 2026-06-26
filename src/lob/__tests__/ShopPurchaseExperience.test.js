import ShopPurchaseExperience from '../ShopPurchaseExperience';

const {
  setUserCoursePurchasesInAvailableCatalog,
  setCourseTierAccessPurchasedInUserCourses,
} = ShopPurchaseExperience;

// ---------------------------------------------------------------------------
// setUserCoursePurchasesInAvailableCatalog
// ---------------------------------------------------------------------------
describe('setUserCoursePurchasesInAvailableCatalog', () => {
  const makeCatalog = () => [
    {
      courseCodeId: 'SUP_SEP_2024_COURSE_01',
      tiers: {
        Free: { price: 0 },
        Gold: { price: 49 },
        Silver: { price: 29 },
      },
    },
  ];

  it('marks the matching tier as isPurchased', async () => {
    const userCourses = {
      'SUP_SEP_2024_COURSE_01': { courseTierAccess: 'Gold' },
    };
    const result = await setUserCoursePurchasesInAvailableCatalog(userCourses, makeCatalog());
    expect(result[0].tiers.Gold.isPurchased).toBe(true);
  });

  it('marks non-purchased tiers as isPurchased false', async () => {
    const userCourses = {
      'SUP_SEP_2024_COURSE_01': { courseTierAccess: 'Gold' },
    };
    const result = await setUserCoursePurchasesInAvailableCatalog(userCourses, makeCatalog());
    expect(result[0].tiers.Free.isPurchased).toBe(false);
    expect(result[0].tiers.Silver.isPurchased).toBe(false);
  });

  it('is case-insensitive when matching tier names', async () => {
    const userCourses = {
      'SUP_SEP_2024_COURSE_01': { courseTierAccess: 'gold' },
    };
    const result = await setUserCoursePurchasesInAvailableCatalog(userCourses, makeCatalog());
    expect(result[0].tiers.Gold.isPurchased).toBe(true);
  });

  it('marks all tiers as not purchased when course is not in userCourses', async () => {
    const result = await setUserCoursePurchasesInAvailableCatalog({}, makeCatalog());
    Object.values(result[0].tiers).forEach(tier => {
      expect(tier.isPurchased).toBe(false);
    });
  });

  it('does not mutate the original catalog', async () => {
    const catalog = makeCatalog();
    const originalFreePrice = catalog[0].tiers.Free.price;
    await setUserCoursePurchasesInAvailableCatalog({}, catalog);
    expect(catalog[0].tiers.Free.price).toBe(originalFreePrice);
    expect(catalog[0].tiers.Free.isPurchased).toBeUndefined();
  });

  it('returns empty array when catalog is empty', async () => {
    const result = await setUserCoursePurchasesInAvailableCatalog({}, []);
    expect(result).toEqual([]);
  });

  it('handles undefined userCourses gracefully', async () => {
    const result = await setUserCoursePurchasesInAvailableCatalog(undefined, makeCatalog());
    expect(Array.isArray(result)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// setCourseTierAccessPurchasedInUserCourses
// ---------------------------------------------------------------------------
describe('setCourseTierAccessPurchasedInUserCourses', () => {
  const userCourses = {
    'SUP_SEP_2024_COURSE_01': { courseTierAccess: 'Free', isEnrolled: true },
    'HH_JAN_2024_COURSE_01': { courseTierAccess: 'Silver', isEnrolled: true },
  };

  it('updates courseTierAccess for the specified course', async () => {
    const result = await setCourseTierAccessPurchasedInUserCourses(
      userCourses,
      'SUP_SEP_2024_COURSE_01',
      'Gold'
    );
    expect(result['SUP_SEP_2024_COURSE_01'].courseTierAccess).toBe('Gold');
  });

  it('does not affect other courses', async () => {
    const result = await setCourseTierAccessPurchasedInUserCourses(
      userCourses,
      'SUP_SEP_2024_COURSE_01',
      'Gold'
    );
    expect(result['HH_JAN_2024_COURSE_01'].courseTierAccess).toBe('Silver');
  });

  it('does not mutate the original userCourses object', async () => {
    const copy = { ...userCourses };
    await setCourseTierAccessPurchasedInUserCourses(copy, 'SUP_SEP_2024_COURSE_01', 'Gold');
    expect(copy['SUP_SEP_2024_COURSE_01'].courseTierAccess).toBe('Free');
  });

  it('returns unchanged userCourses when courseCodeId is not found', async () => {
    const result = await setCourseTierAccessPurchasedInUserCourses(
      userCourses,
      'NONEXISTENT_COURSE',
      'Gold'
    );
    expect(result).toEqual(userCourses);
  });

  it('returns unchanged userCourses when courseCodeId is empty', async () => {
    const result = await setCourseTierAccessPurchasedInUserCourses(userCourses, '', 'Gold');
    expect(result).toEqual(userCourses);
  });

  it('defaults courseTierAccess to "Free" when not provided', async () => {
    const result = await setCourseTierAccessPurchasedInUserCourses(
      userCourses,
      'SUP_SEP_2024_COURSE_01'
    );
    expect(result['SUP_SEP_2024_COURSE_01'].courseTierAccess).toBe('Free');
  });
});
