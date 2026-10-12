import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ContributorSearch from '../src/components/ContributorSearch.vue';

// Mock vue-router
const mockPush = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush
  })
}));

describe('ContributorSearch Component', () => {
  it('renders search input and submit button', () => {
    const wrapper = mount(ContributorSearch);
    const input = wrapper.find('input[type="text"]');
    const button = wrapper.find('button[type="submit"]');

    expect(input.exists()).toBe(true);
    expect(button.exists()).toBe(true);
    expect(button.text()).toContain('Analyze Contributions');
  });

  it('navigates to user profile on form submission', async () => {
    const wrapper = mount(ContributorSearch);
    const input = wrapper.find('input[type="text"]');

    await input.setValue('legoktm');
    await wrapper.find('form').trigger('submit.prevent');

    expect(mockPush).toHaveBeenCalledWith('/user/legoktm');
  });

  it('renders sample contributor chips for quick launch', () => {
    const wrapper = mount(ContributorSearch);
    const chips = wrapper.findAll('.wgt-sample-chip');
    expect(chips.length).toBeGreaterThanOrEqual(3);
    expect(chips[0].text()).toBe('legoktm');
  });
});
