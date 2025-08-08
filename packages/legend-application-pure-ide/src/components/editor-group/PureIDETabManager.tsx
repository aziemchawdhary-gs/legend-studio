/**
 * Copyright (c) 2020-present, Goldman Sachs
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { observer } from 'mobx-react-lite';
import {
  clsx,
  ArrowsSplitIcon,
  TimesIcon,
  CompressIcon,
  ContextMenu,
  MenuContent,
  MenuContentItem,
  MenuContentDivider,
  ChevronDownIcon,
  ControlledDropdownMenu,
} from '@finos/legend-art';
import type { TabState } from '@finos/legend-lego/application';
import { usePureIDEStore } from '../PureIDEStoreProvider.js';
import type { PureIDETabManagerState } from '../../stores/PureIDETabManagerState.js';
import {
  type EditorSplitLeaf,
  EditorSplitOrientation,
} from '../../stores/EditorSplitGroupState.js';

const PureIDETabContextMenu = observer(
  (props: {
    tabState: TabState;
    managerTabState: PureIDETabManagerState;
    leaf: EditorSplitLeaf;
  }) => {
    const { tabState, managerTabState, leaf } = props;
    const ideStore = usePureIDEStore();

    const close = (): void => managerTabState.closeTab(tabState);
    const closeOthers = (): void => managerTabState.closeAllOtherTabs(tabState);
    const closeAll = (): void => managerTabState.closeAllTabs();
    const togglePin = () => {
      if (tabState.isPinned) {
        managerTabState.unpinTab(tabState);
      } else {
        managerTabState.pinTab(tabState);
      }
    };

    const handleSplitRight = (): void => {
      ideStore.editorSplitState.splitLeaf(
        leaf,
        EditorSplitOrientation.VERTICAL,
      );
    };

    const handleSplitDown = (): void => {
      ideStore.editorSplitState.splitLeaf(
        leaf,
        EditorSplitOrientation.HORIZONTAL,
      );
    };

    const handleRemoveSplit = (): void => {
      ideStore.editorSplitState.removeSplit(leaf);
    };

    const handleUnsplitAll = (): void => {
      ideStore.editorSplitState.unsplitAll();
    };

    return (
      <MenuContent>
        <MenuContentItem onClick={close}>Close</MenuContentItem>
        <MenuContentItem
          disabled={managerTabState.tabs.length < 2}
          onClick={closeOthers}
        >
          Close Others
        </MenuContentItem>
        <MenuContentItem onClick={closeAll}>Close All</MenuContentItem>
        <MenuContentDivider />
        <MenuContentItem onClick={handleSplitRight}>
          <div className="editor-group__context-menu__item">
            <div className="editor-group__context-menu__item__icon">
              <ArrowsSplitIcon />
            </div>
            <div className="editor-group__context-menu__item__label">
              Split Right
            </div>
          </div>
        </MenuContentItem>
        <MenuContentItem onClick={handleSplitDown}>
          <div className="editor-group__context-menu__item">
            <div className="editor-group__context-menu__item__icon">
              <ArrowsSplitIcon className="editor-group__context-menu__item__icon--rotated" />
            </div>
            <div className="editor-group__context-menu__item__label">
              Split Down
            </div>
          </div>
        </MenuContentItem>
        {ideStore.editorSplitState.canRemoveSplit(leaf) && (
          <MenuContentItem onClick={handleRemoveSplit}>
            <div className="editor-group__context-menu__item">
              <div className="editor-group__context-menu__item__icon">
                <TimesIcon />
              </div>
              <div className="editor-group__context-menu__item__label">
                Remove Split
              </div>
            </div>
          </MenuContentItem>
        )}
        {ideStore.editorSplitState.hasSplits() && (
          <MenuContentItem onClick={handleUnsplitAll}>
            <div className="editor-group__context-menu__item">
              <div className="editor-group__context-menu__item__icon">
                <CompressIcon />
              </div>
              <div className="editor-group__context-menu__item__label">
                Unsplit All
              </div>
            </div>
          </MenuContentItem>
        )}
        <MenuContentDivider />
        <MenuContentItem onClick={togglePin}>
          {tabState.isPinned ? 'Unpin' : 'Pin'}
        </MenuContentItem>
      </MenuContent>
    );
  },
);

interface PureIDETabManagerProps {
  tabManagerState: PureIDETabManagerState;
  leaf: EditorSplitLeaf;
  tabRenderer?: ((editorState: TabState) => React.ReactNode) | undefined;
}

export const PureIDETabManager = observer((props: PureIDETabManagerProps) => {
  const { tabManagerState, leaf, tabRenderer } = props;

  // For now, we'll override the base TabManager's context menu by wrapping it
  // and providing our custom context menu for tabs
  return (
    <div className="tab-manager">
      <div className="tab-manager__header">
        <div className="tab-manager__tabs">
          {tabManagerState.tabs.map((tab) => (
            <ContextMenu
              key={tab.uuid}
              content={
                <PureIDETabContextMenu
                  tabState={tab}
                  managerTabState={tabManagerState}
                  leaf={leaf}
                />
              }
              className={clsx('tab-manager__tab', {
                'tab-manager__tab--active': tab === tabManagerState.currentTab,
              })}
            >
              <div
                className="tab-manager__tab__content"
                onClick={() => tabManagerState.openTab(tab)}
              >
                {tabRenderer ? (
                  tabRenderer(tab)
                ) : (
                  <div className="tab-manager__tab__content__label">
                    {tab.label}
                  </div>
                )}
              </div>
              <button
                className="tab-manager__tab__close-btn"
                onClick={(event) => {
                  event.stopPropagation();
                  tabManagerState.closeTab(tab);
                }}
                tabIndex={-1}
                title="Close"
              >
                <TimesIcon />
              </button>
            </ContextMenu>
          ))}
        </div>
        {tabManagerState.tabs.length > 0 && (
          <div className="tab-manager__header__actions">
            <ControlledDropdownMenu
              className="tab-manager__menu__toggler"
              title="Show All Tabs"
              content={
                <MenuContent className="tab-manager__menu">
                  {tabManagerState.tabs.map((tabState) => (
                    <MenuContentItem
                      key={tabState.uuid}
                      className={clsx('tab-manager__menu__item', {
                        'tab-manager__menu__item--active':
                          tabState === tabManagerState.currentTab,
                      })}
                      onClick={() => tabManagerState.openTab(tabState)}
                    >
                      <div className="tab-manager__menu__item__label">
                        {tabState.label}
                      </div>
                      <div
                        className="tab-manager__menu__item__close-btn"
                        onClick={(event) => {
                          event.stopPropagation();
                          tabManagerState.closeTab(tabState);
                        }}
                        tabIndex={-1}
                        title="Close"
                      >
                        <TimesIcon />
                      </div>
                    </MenuContentItem>
                  ))}
                </MenuContent>
              }
              menuProps={{
                anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
                transformOrigin: { vertical: 'top', horizontal: 'right' },
              }}
            >
              <ChevronDownIcon />
            </ControlledDropdownMenu>
          </div>
        )}
      </div>
    </div>
  );
});

PureIDETabManager.displayName = 'PureIDETabManager';
