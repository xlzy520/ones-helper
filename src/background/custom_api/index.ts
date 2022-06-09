import { HeaderCustomer } from '../utils/header_customer';
import { customApiService } from '../../service';
import { PatternConfig } from '~/service/custom_api';

const headerCustomer = new HeaderCustomer();

async function syncPatterns(headerCustomer: HeaderCustomer) {
  const customApiData = await customApiService.getCustomApi();
  const { customApiPatterns } = customApiData;
  const patterns: string[] = customApiPatterns
    .filter((patternConfig: PatternConfig) => {
      return patternConfig.enable;
    })
    .map((patternConfig: PatternConfig) => {
      return patternConfig.pattern;
    });
  headerCustomer.setPatterns(patterns || []);
}

export function customApi(): void {
  syncPatterns(headerCustomer);
}
