import { useState, useCallback } from 'react';
import { SearchConfig, SearchResultItem, SearchParams } from '../types/modalSearchTypes';

export interface UseModalSearchResult {
    isOpen: boolean;
    openModal: (config: SearchConfig, initialValues?: SearchParams) => void;
    closeModal: () => void;
    config: SearchConfig | null;
    initialValues: SearchParams;
    handleSelect: (onSelect: (item: SearchResultItem) => void) => (item: SearchResultItem) => void;
}

/**
 * Custom hook for managing modal search state
 * 
 * @example
 * const modalSearch = useModalSearch();
 * 
 * const handleOpenProductSearch = () => {
 *   modalSearch.openModal(SEARCH_CONFIGS.PRODUCTO, { estado: 'activo' });
 * };
 * 
 * const handleProductSelect = modalSearch.handleSelect((product) => {
 *   console.log('Selected product:', product);
 *   setValue('productId', product.id);
 * });
 * 
 * return (
 *   <>
 *     <Button onClick={handleOpenProductSearch}>Buscar Producto</Button>
 *     <ModalSearch
 *       open={modalSearch.isOpen}
 *       onClose={modalSearch.closeModal}
 *       onSelect={handleProductSelect}
 *       config={modalSearch.config!}
 *       initialValues={modalSearch.initialValues}
 *     />
 *   </>
 * );
 */
export const useModalSearch = (): UseModalSearchResult => {
    const [isOpen, setIsOpen] = useState(false);
    const [config, setConfig] = useState<SearchConfig | null>(null);
    const [initialValues, setInitialValues] = useState<SearchParams>({});

    const openModal = useCallback((searchConfig: SearchConfig, values: SearchParams = {}) => {
        setConfig(searchConfig);
        setInitialValues(values);
        setIsOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsOpen(false);
        setConfig(null);
        setInitialValues({});
    }, []);

    const handleSelect = useCallback((onSelect: (item: SearchResultItem) => void) => {
        return (item: SearchResultItem) => {
            onSelect(item);
            closeModal();
        };
    }, [closeModal]);

    return {
        isOpen,
        openModal,
        closeModal,
        config,
        initialValues,
        handleSelect
    };
};

export default useModalSearch;