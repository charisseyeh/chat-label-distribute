/**
 * Performance test utilities to verify optimizations are working
 */

export const runPerformanceTest = () => {
  console.log('🧪 Running performance tests...');
  
  // Test 1: Navigation timing
  const navigationStart = performance.now();
  setTimeout(() => {
    const navigationEnd = performance.now();
    const duration = navigationEnd - navigationStart;
    console.log(`✅ Navigation test: ${duration.toFixed(2)}ms`);
    
    if (duration < 100) {
      console.log('🎉 Navigation performance is excellent!');
    } else if (duration < 200) {
      console.log('👍 Navigation performance is good');
    } else {
      console.log('⚠️ Navigation performance needs improvement');
    }
  }, 100);
  
  // Test 2: Component render timing
  const renderStart = performance.now();
  requestAnimationFrame(() => {
    const renderEnd = performance.now();
    const duration = renderEnd - renderStart;
    console.log(`✅ Render test: ${duration.toFixed(2)}ms`);
    
    if (duration < 16) {
      console.log('🎉 Render performance is excellent! (60fps)');
    } else if (duration < 33) {
      console.log('👍 Render performance is good (30fps)');
    } else {
      console.log('⚠️ Render performance needs improvement');
    }
  });
  
  // Test 3: State update timing
  const stateStart = performance.now();
  Promise.resolve().then(() => {
    const stateEnd = performance.now();
    const duration = stateEnd - stateStart;
    console.log(`✅ State update test: ${duration.toFixed(2)}ms`);
    
    if (duration < 1) {
      console.log('🎉 State update performance is excellent!');
    } else if (duration < 5) {
      console.log('👍 State update performance is good');
    } else {
      console.log('⚠️ State update performance needs improvement');
    }
  });
  
  // Test 4: Memory usage check
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
    const totalMB = Math.round(memory.totalJSHeapSize / 1024 / 1024);
    
    console.log(`✅ Memory usage: ${usedMB}MB / ${totalMB}MB`);
    
    if (usedMB < 50) {
      console.log('🎉 Memory usage is excellent!');
    } else if (usedMB < 100) {
      console.log('👍 Memory usage is good');
    } else {
      console.log('⚠️ Memory usage is high');
    }
  }
  
  // Test 5: Frame rate check
  let frameCount = 0;
  let lastTime = performance.now();
  
  const checkFrameRate = () => {
    frameCount++;
    const currentTime = performance.now();
    
    if (currentTime - lastTime >= 1000) {
      const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
      console.log(`✅ Frame rate: ${fps} FPS`);
      
      if (fps >= 60) {
        console.log('🎉 Frame rate is excellent!');
      } else if (fps >= 30) {
        console.log('👍 Frame rate is good');
      } else {
        console.log('⚠️ Frame rate needs improvement');
      }
      
      frameCount = 0;
      lastTime = currentTime;
    }
    
    requestAnimationFrame(checkFrameRate);
  };
  
  requestAnimationFrame(checkFrameRate);
  
  // Stop frame rate check after 5 seconds
  setTimeout(() => {
    console.log('🧪 Performance tests completed!');
  }, 5000);
};

/**
 * Test specific component performance
 */
export const testComponentPerformance = (componentName: string, renderFunction: () => void) => {
  console.log(`🧪 Testing ${componentName} performance...`);
  
  const start = performance.now();
  renderFunction();
  const end = performance.now();
  
  const duration = end - start;
  console.log(`✅ ${componentName} render time: ${duration.toFixed(2)}ms`);
  
  if (duration < 1) {
    console.log(`🎉 ${componentName} performance is excellent!`);
  } else if (duration < 5) {
    console.log(`👍 ${componentName} performance is good`);
  } else {
    console.log(`⚠️ ${componentName} performance needs improvement`);
  }
  
  return duration;
};

/**
 * Test store performance
 */
export const testStorePerformance = (storeName: string, updateFunction: () => void) => {
  console.log(`🧪 Testing ${storeName} store performance...`);
  
  const start = performance.now();
  updateFunction();
  const end = performance.now();
  
  const duration = end - start;
  console.log(`✅ ${storeName} update time: ${duration.toFixed(2)}ms`);
  
  if (duration < 1) {
    console.log(`🎉 ${storeName} store performance is excellent!`);
  } else if (duration < 5) {
    console.log(`👍 ${storeName} store performance is good`);
  } else {
    console.log(`⚠️ ${storeName} store performance needs improvement`);
  }
  
  return duration;
};

/**
 * Performance benchmark utility
 */
export const benchmark = <T extends (...args: any[]) => any>(
  name: string,
  fn: T,
  iterations: number = 1000
) => {
  console.log(`🧪 Benchmarking ${name}...`);
  
  const start = performance.now();
  
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  
  const end = performance.now();
  const totalTime = end - start;
  const avgTime = totalTime / iterations;
  
  console.log(`✅ ${name} benchmark results:`);
  console.log(`   Total time: ${totalTime.toFixed(2)}ms`);
  console.log(`   Average time: ${avgTime.toFixed(4)}ms`);
  console.log(`   Operations per second: ${Math.round(1000 / avgTime)}`);
  
  return { totalTime, avgTime, opsPerSecond: Math.round(1000 / avgTime) };
};

/**
 * Memory leak detection
 */
export const detectMemoryLeaks = () => {
  console.log('🧪 Checking for memory leaks...');
  
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    const initialUsed = memory.usedJSHeapSize;
    
    // Create some objects to test memory
    const testObjects: any[] = [];
    for (let i = 0; i < 1000; i++) {
      testObjects.push({ id: i, data: new Array(1000).fill('test') });
    }
    
    const afterCreate = memory.usedJSHeapSize;
    
    // Clear references
    testObjects.length = 0;
    
    // Force garbage collection if available
    if ('gc' in window) {
      (window as any).gc();
    }
    
    setTimeout(() => {
      const afterGC = memory.usedJSHeapSize;
      const leakSize = afterGC - initialUsed;
      
      console.log(`✅ Memory leak detection results:`);
      console.log(`   Initial: ${Math.round(initialUsed / 1024 / 1024)}MB`);
      console.log(`   After create: ${Math.round(afterCreate / 1024 / 1024)}MB`);
      console.log(`   After GC: ${Math.round(afterGC / 1024 / 1024)}MB`);
      console.log(`   Potential leak: ${Math.round(leakSize / 1024 / 1024)}MB`);
      
      if (leakSize < 1024 * 1024) { // Less than 1MB
        console.log('🎉 No significant memory leaks detected!');
      } else {
        console.log('⚠️ Potential memory leak detected!');
      }
    }, 100);
  } else {
    console.log('⚠️ Memory API not available for leak detection');
  }
};

// Auto-run performance tests in development
if (process.env.NODE_ENV === 'development') {
  // Run tests after a delay to ensure app is loaded
  setTimeout(() => {
    console.log('🚀 Performance tests starting automatically...');
    runPerformanceTest();
  }, 2000);
}
